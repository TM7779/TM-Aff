"""Writes a Saving Tips article (a brand's discount code guide or its review) from a JSON file.

    python3 tools/new-article.py path/to/spec.json

The code, the discount and the affiliate link come from the store in assets/snapshot.js, so they
always match the sheet (run `node tools/snapshot.mjs` first). The tool also:
  - adds the article to assets/posts.js and sitemap.xml;
  - links it from the other guides ("Shopping another brand?") or reviews ("More brand reviews"),
    and, for a guide, from about.html; links the brand's guide and review to each other;
  - writes the site header (tools/static-header.py) and the "On this page" list, "Written by" box
    and search data (tools/article-seo.py).
Running it again with the same spec rewrites the article in place.

Spec (see tools/article-examples/ for a full guide and review):
  type          "guide" or "review"
  store         the store's slug in the sheet, like "niepceinc"
  slug          the article's name: saving-tips-<slug>-discount-code.html or saving-tips-<slug>-review.html
  brand         the name used in sentences, like "Niepce"
  date          the day the facts were checked, "YYYY-MM-DD"
  title         the headline (h1), also og:title and the card title
  title_tag     the <title>, like "Niepce Inc Discount Code 2026: 10% Off | Kinsley Deals"
  description   meta description; excerpt: the card text
  image, image_alt, focus (optional CSS object-position for the photo)
  lede          the opening paragraph
  cart_tip      guide only: the sentence after "Add what you want to your cart."
  sections      a list of {"figure": {...} (optional), "h2": "...", "parts": [...]}. A part is a
                paragraph (text or HTML), {"table": {"head": [...], "rows": [[...]]}},
                {"small": "..."}, {"list": [...]}, or {"h3": "..."}. A figure is
                {"src", "alt", "width", "height"}. A guide's "How to use" steps and "If the code
                doesn't work" list are added for you around the sections.
  faq           about 10 [question, answer] pairs
  trustpilot    review only: the Trustpilot domain (as in trustpilot.com/review/<domain>), or null
  sources       optional extra [url, title, what it was used for] lists
In any text, {code} and {pct} become the live code and discount, [Some text](saving-tips-x.html)
a link to another article, and {shop:Some text} a link to the store through its affiliate link. A bare & is fine. Never link to the store any other way.
"""

import datetime
import glob
import html
import json
import os
import re
import subprocess
import sys

SITE = "https://kinsleydeals.com/"
ICONS = ('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
         '<link rel="icon" href="/assets/favicon-96.png" sizes="96x96" type="image/png">\n'
         '<link rel="apple-touch-icon" href="/apple-touch-icon.png">')
KINDS = {
    "guide": dict(suffix="discount-code", category="coupon-guides", crumb="Coupon guides",
                  list_intro="Shopping another brand? See our discount code guides for ", link_word="guide"),
    "review": dict(suffix="review", category="reviews", crumb="Brand reviews",
                   list_intro="More brand reviews: ", link_word="review"),
}


def esc(s):
    return html.escape(s, quote=True)


def amp(s):
    """Escapes a bare & in text that is otherwise HTML."""
    return re.sub(r"&(?![a-zA-Z]+;|#\d+;)", "&amp;", s)


def possessive(name):
    return name if name.endswith(("'s", "’s")) else name + "'s"


def shopify_sized(url, width, attr=False):
    if "cdn.shopify.com" not in url:
        return url
    return url + ("&amp;" if attr and "?" in url else "&" if "?" in url else "?") + f"width={width}"


def img(url, alt, widths, sizes, width, height, extra):
    src = shopify_sized(url, widths[-1])
    srcset = ""
    if "cdn.shopify.com" in url:
        srcset = ' srcset="' + ", ".join(f"{shopify_sized(url, w, True)} {w}w" for w in widths) + f'" sizes="{sizes}"'
    return f'<img src="{src}"{srcset} alt="{esc(alt)}" width="{width}" height="{height}"{extra}>'


def read_store(slug):
    text = open("assets/snapshot.js", encoding="utf-8").read()
    data = json.loads(text[text.index("{"): text.rindex("}") + 1])
    store = next((s for s in data["stores"] if s["slug"] == slug), None)
    if not store:
        sys.exit(f"No store '{slug}' in assets/snapshot.js. Run `node tools/snapshot.mjs` first.")
    coupon = next((c for c in store.get("coupons", []) if c.get("code")), None)
    if not coupon:
        sys.exit(f"The sheet has no code for '{slug}', so there's nothing for a discount code article to say.")
    return store, coupon


class Writer:
    def __init__(self, spec):
        self.s = spec
        self.kind = KINDS[spec["type"]]
        self.store, coupon = read_store(spec["store"])
        self.code, self.pct, self.aff = coupon["code"], coupon["discount"], self.store["url"]
        self.brand = spec["brand"]
        self.file = f"saving-tips-{spec['slug']}-{self.kind['suffix']}.html"
        self.guide = f"saving-tips-{spec['slug']}-discount-code.html"
        self.review = f"saving-tips-{spec['slug']}-review.html"
        d = datetime.date.fromisoformat(spec["date"])
        self.date_text = f"{d:%B} {d.day}, {d.year}"
        self.month = f"{d:%B %Y}"

    def text(self, s):
        st = self.s["store"]
        s = amp(s)
        s = s.replace("{code}", f'<strong data-code="{st}">{esc(self.code)}</strong>')
        s = s.replace("{pct}", f'<span data-discount="{st}">{esc(self.pct)}</span>')
        s = re.sub(r"\[([^\]\n]+)\]\((saving-tips-[^)\s]+\.html)\)", r'<a href="\2">\1</a>', s)
        return re.sub(r"\{shop:([^}]+)\}",
                      lambda m: f'<a data-shop="{st}" href="{esc(self.aff)}" target="_blank" rel="sponsored nofollow noopener">{m.group(1)}</a>', s)

    def plain(self, s):
        """The text as the page shows it, for meta tags and search data."""
        s = s.replace("{code}", self.code).replace("{pct}", self.pct)
        s = re.sub(r"\[([^\]\n]+)\]\((saving-tips-[^)\s]+\.html)\)", r"\1", s)
        return re.sub(r"\{shop:([^}]+)\}", r"\1", s)

    def part(self, p):
        if isinstance(p, str):
            p = self.text(p)
            return f"    {p}" if p.lstrip().startswith("<") else f"    <p>{p}</p>"
        if "table" in p:
            t = p["table"]
            head = "".join(f'<th scope="col">{self.text(h)}</th>' for h in t["head"])
            rows = "\n".join("          <tr>" + "".join(f"<td>{self.text(str(c))}</td>" for c in r) + "</tr>" for r in t["rows"])
            return (f'    <div class="post-table-wrap">\n      <table class="post-table">\n        <thead><tr>{head}</tr></thead>\n'
                    f"        <tbody>\n{rows}\n        </tbody>\n      </table>\n    </div>")
        if "small" in p:
            return f'    <p class="post-small">{self.text(p["small"])}</p>'
        if "list" in p:
            items = "\n".join(f"      <li>{self.text(i)}</li>" for i in p["list"])
            return f"    <ul>\n{items}\n    </ul>"
        if "h3" in p:
            return f"    <h3>{self.text(p['h3'])}</h3>"
        sys.exit(f"Unknown part: {p}")

    def figure(self, f):
        return ('    <figure class="post-figure">\n      '
                + img(f["src"], f["alt"], [300, 450, 600], "(max-width: 600px) 240px, 380px", f.get("width", 300),
                      f.get("height", 400), ' loading="lazy" decoding="async"')
                + "\n    </figure>")

    def section(self, sec):
        out = []
        if sec.get("figure"):
            out.append(self.figure(sec["figure"]))
        out.append(f"    <h2>{self.text(sec['h2'])}</h2>")
        out += [self.part(p) for p in sec.get("parts", [])]
        return "\n".join(out)

    def cross_links(self):
        """The paragraph linking every other article of the same kind, in posts.js order."""
        names = link_names(self.kind["list_intro"])
        names[self.file] = self.brand
        links = [f'<a href="{u}">{amp(names[u])}</a>' for u in post_urls(self.kind["category"]) if u != self.file and u in names]
        return f"    <p>{self.kind['list_intro']}{join_and(links)}.</p>" if links else ""

    def body(self):
        st, brand = self.s["store"], self.brand
        offer = (f'    <div class="post-offer" data-offer="{st}">\n      <p>Save <span data-discount="{st}">{esc(self.pct)}</span> at '
                 f'{amp(brand)} with code <strong data-code="{st}">{esc(self.code)}</strong>. <a data-shop="{st}" href="{esc(self.aff)}" '
                 f'target="_blank" rel="sponsored nofollow noopener">Shop at {amp(brand)}</a></p>\n    </div>')
        if self.s["type"] == "guide":
            note = (f"Kinsley Deals earns a commission when you buy through links on this page, at no extra cost to you. "
                    f"Prices are {possessive(brand)} US prices in {self.month}, before any code, and can change.")
        else:
            note = (f"Kinsley Deals earns a commission when you buy through links on this page, at no extra cost to you. "
                    f"This review brings together {possessive(brand)} own product facts, public ratings and buying terms as we "
                    f"found them on {self.date_text}. We haven't tested the products ourselves.")
        out = [f'    <p class="post-note">{amp(note)}</p>', offer]
        code = f'<strong data-code="{st}">{esc(self.code)}</strong>'
        if self.s["type"] == "guide":
            out.append(f"""    <h2>How to use the {amp(brand)} discount code</h2>
    <ol class="post-steps">
      <li><strong>Select Show code above.</strong> The code is copied for you and {amp(brand)} opens.</li>
      <li><strong>Add what you want to your cart.</strong> {self.text(self.s.get("cart_tip", ""))}</li>
      <li><strong>Paste the code at checkout.</strong> Find the discount code box, paste {code} and select Apply.</li>
      <li><strong>Check the total before you pay.</strong> The discount shows as its own line in the order summary.</li>
    </ol>""")
        out += [self.section(sec) for sec in self.s["sections"]]
        if self.s["type"] == "guide":
            out.append(f"""    <h2>If the {amp(brand)} code doesn't work</h2>
    <ul>
      <li><strong>Check the spelling.</strong> Type {code} exactly, with no spaces before or after.</li>
      <li><strong>Remove other codes.</strong> Most stores accept one discount code per order.</li>
      <li><strong>Compare with sale prices.</strong> Items that are already discounted may not take an extra code. If the code isn't accepted, compare the totals and keep the lower one.</li>
      <li><strong>Check our {amp(brand)} page.</strong> We list the current code on our <a href="store.html?s={st}">{amp(brand)} coupon page</a>.</li>
    </ul>""")
            if os.path.exists(self.review):
                out.append(review_link(brand, self.review))
        out.append(self.cross_links())
        faq = "\n".join(f"      <details>\n        <summary>{self.text(q)}</summary>\n        <p>{self.text(a)}</p>\n      </details>"
                        for q, a in self.s["faq"])
        out.append(f'    <h2>Questions people ask</h2>\n    <div class="faq">\n{faq}\n    </div>')
        what = ("product details, prices, on-site ratings and store policies" if self.s["type"] == "review"
                else "prices, shipping and return policies")
        src = [f'<li><a data-shop="{st}" href="{esc(self.aff)}" target="_blank" rel="sponsored nofollow noopener">{amp(possessive(brand))} '
               f"website</a>: {what}, checked on {self.date_text}.</li>"]
        if self.s["type"] == "review":
            tp = self.s.get("trustpilot")
            src.append(f'<li><a href="https://www.trustpilot.com/review/{esc(tp)}" target="_blank" rel="nofollow noopener">{amp(brand)} on '
                       f"Trustpilot</a>: rating and review count, checked on {self.date_text}.</li>" if tp else
                       f"<li>Trustpilot: we searched for {amp(brand)} on {self.date_text} and found no profile.</li>")
        for url, title, used in self.s.get("sources", []):
            src.append(f'<li><a href="{esc(url)}" target="_blank" rel="noopener">{amp(title)}</a>: {amp(used)}.</li>')
        out.append("    <h2>Sources</h2>\n    <ul class=\"post-sources\">\n      " + "\n      ".join(src) + "\n    </ul>")
        return "\n\n".join(o for o in out if o)

    def page(self):
        s, k = self.s, self.kind
        url = SITE + self.file
        title, desc = s["title"], self.plain(s["description"])
        image = s["image"]
        og_image = shopify_sized(image, 1200)
        blog = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": title, "description": desc,
                "image": og_image, "datePublished": s["date"], "dateModified": s["date"],
                "author": {"@type": "Organization", "name": "Kinsley Deals"}, "publisher": {"@type": "Organization", "name": "Kinsley Deals"},
                "mainEntityOfPage": url}
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Kinsley Deals", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Saving Tips", "item": SITE + "saving-tips.html"},
            {"@type": "ListItem", "position": 3, "name": k["crumb"], "item": SITE + f"saving-tips.html?t={k['category']}"},
            {"@type": "ListItem", "position": 4, "name": title}]}
        faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": []}  # filled by tools/article-seo.py
        ld = lambda d: '<script type="application/ld+json">\n' + json.dumps(d, indent=2, ensure_ascii=False) + "\n</script>"
        assets = assets_block()
        hero = img(image, s["image_alt"], [480, 800, 1200, 1600], "(max-width: 1040px) 100vw, 1000px", 1600, 900,
                   ' fetchpriority="high"' + (f' style="object-position: {esc(s["focus"])}"' if s.get("focus") else ""))
        body = self.body()
        words = len(re.sub(r"<[^>]+>", " ", body).split())
        self.minutes = max(3, round(words / 200))
        return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(s["title_tag"])}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
{ICONS}
<meta name="theme-color" content="#261A2E">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Kinsley Deals">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{esc(og_image)}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
{ld(blog)}
{ld(faq)}
{ld(crumbs)}
<link rel="preconnect" href="https://cdn.shopify.com">
<link rel="preload" href="assets/fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/gloock-latin.woff2" as="font" type="font/woff2" crossorigin>
{assets["css"]}
</head>
<body data-page="post">
<div id="header"></div>
<main id="main">
<article class="post">
  <header class="post-head">
    <div class="crumbs"><a href="saving-tips.html">Saving Tips</a> / <a href="saving-tips.html?t={k["category"]}">{k["crumb"]}</a></div>
    <h1>{amp(title)}</h1>
    <p class="post-lede">{self.text(s["lede"])}</p>
    <p class="post-meta"><time datetime="{s["date"]}">{self.date_text}</time><span>{self.minutes} min read</span></p>
  </header>

  <figure class="post-hero">
    {hero}
  </figure>

  <div class="post-body">
{body}
  </div>
</article>

<section class="section" aria-labelledby="related-title">
  <div class="wrap">
    <div class="section-head"><h2 id="related-title">More saving tips</h2></div>
    <ul class="posts" id="related"></ul>
  </div>
</section>
</main>
{assets["scripts"]}
</body>
</html>
"""


def assets_block():
    """The stylesheet and script tags of an existing article, so ?v= numbers stay in step."""
    ref = open(sorted(glob.glob("saving-tips-*-discount-code.html"))[0], encoding="utf-8").read()
    css = re.search(r'<link rel="stylesheet" href="assets/styles\.css[^"]*">', ref).group(0)
    scripts = re.search(r'<div id="footer"></div>.*?(?=\n</body>)', ref, re.S).group(0)
    return {"css": css, "scripts": scripts}


def post_urls(category):
    js = open("assets/posts.js", encoding="utf-8").read()
    return [u for u, c in re.findall(r'url: "([^"]+)",.*?category: "([^"]+)"', js, re.S) if c == category]


def link_names(intro):
    """Link text for each article, read from the cross-link paragraphs that already exist."""
    names = {}
    for path in glob.glob("saving-tips-*.html"):
        m = re.search(r"<p>" + re.escape(intro) + r"(.*?)\.</p>", open(path, encoding="utf-8").read(), re.S)
        if m:
            names.update({u: html.unescape(t) for u, t in re.findall(r'<a href="([^"]+)">(.*?)</a>', m.group(1))})
    return names


def join_and(items):
    return items[0] if len(items) == 1 else ", ".join(items[:-1]) + " and " + items[-1]


def review_link(brand, review):
    return (f'    <p>Not sure about {amp(brand)} yet? Read our <a href="{review}">{amp(brand)} review</a>: '
            "ratings, pros and cons, and who it suits.</p>")


def add_to_list(path, intro, url, name, after=""):
    """Adds a link to the list paragraph that starts with intro, keeping its other links."""
    s = open(path, encoding="utf-8").read()
    pat = re.compile(r"<p>" + re.escape(intro) + r"(.*?)\." + re.escape(after) + r"</p>", re.S)
    m = pat.search(s)
    if not m or f'href="{url}"' in m.group(1):
        return
    links = re.findall(r'<a href="[^"]+">.*?</a>', m.group(1)) + [f'<a href="{url}">{amp(name)}</a>']
    s = s[: m.start()] + f"<p>{intro}{join_and(links)}.{after}</p>" + s[m.end():]
    open(path, "w", encoding="utf-8").write(s)
    print("linked from", path, flush=True)


def update_posts(w):
    s = w.s
    entry = {"slug": f"{s['slug']}-{w.kind['suffix']}", "url": w.file, "title": s["title"], "excerpt": w.plain(s["excerpt"]),
             "image": s["image"], "imageAlt": s["image_alt"], "focus": s.get("focus"), "category": w.kind["category"],
             "store": s["store"], "date": s["date"], "minutes": w.minutes}
    lines = ["  {"]
    for key, val in entry.items():
        if val is None:
            continue
        v = json.dumps(val, ensure_ascii=False)
        lines.append(f"    {key}:\n      {v}," if key == "excerpt" else f"    {key}: {v},")
    block = "\n".join(lines) + "\n  },"
    js = open("assets/posts.js", encoding="utf-8").read()
    old = re.compile(r"  \{\n    slug: " + re.escape(json.dumps(entry["slug"])) + r",.*?\n  \},", re.S)
    if old.search(js):
        js = old.sub(lambda _: block, js)
    else:
        # A guide goes after the last guide, a review at the end of the list.
        same = [m for m in re.finditer(r"  \{\n    slug: .*?\n  \},", js, re.S) if f'category: "{entry["category"]}"' in m.group(0)]
        at = same[-1].end() if same else js.rindex("];")
        js = js[:at] + ("\n" if same else "") + block + ("" if same else "\n") + js[at:]
    open("assets/posts.js", "w", encoding="utf-8").write(js)


def update_sitemap(w):
    sm = open("sitemap.xml", encoding="utf-8").read()
    loc = f"<loc>{SITE}{w.file}</loc>"
    if loc in sm:
        sm = re.sub(re.escape(loc) + r"(<lastmod>[^<]*</lastmod>)?", f"{loc}<lastmod>{w.s['date']}</lastmod>", sm)
    else:
        sm = sm.replace("</urlset>", f"  <url>{loc}<lastmod>{w.s['date']}</lastmod></url>\n</urlset>")
    open("sitemap.xml", "w", encoding="utf-8").write(sm)


def main():
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    w = Writer(spec)
    page = w.page()
    open(w.file, "w", encoding="utf-8").write(page)
    print("wrote", w.file, flush=True)
    update_posts(w)
    update_sitemap(w)
    intro = w.kind["list_intro"]
    for path in sorted(glob.glob("saving-tips-*.html")):
        if path != w.file:
            add_to_list(path, intro, w.file, w.brand)
    if spec["type"] == "guide":
        add_to_list("about.html", "Discount code guides for ", w.file, w.brand, after=' See all of them on <a href="saving-tips.html">Saving Tips</a>.')
    elif os.path.exists(w.guide):
        # The brand's guide gets a link to the new review, above its "Shopping another brand?" list.
        g = open(w.guide, encoding="utf-8").read()
        if f'href="{w.review}"' not in g:
            g = g.replace("    <p>" + KINDS["guide"]["list_intro"], review_link(w.brand, w.review) + "\n\n    <p>" + KINDS["guide"]["list_intro"], 1)
            open(w.guide, "w", encoding="utf-8").write(g)
            print("linked from", w.guide, flush=True)
    here = os.path.dirname(os.path.abspath(__file__))
    subprocess.run([sys.executable, os.path.join(here, "static-header.py")], check=True)
    subprocess.run([sys.executable, os.path.join(here, "article-seo.py")], check=True)


if __name__ == "__main__":
    main()
