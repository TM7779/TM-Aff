"""One page per brand: moves a brand's review into its discount code guide.

On 2026-11-21 Google dropped most of the site's articles from its index ("Crawled - currently not
indexed"). Each brand had two pages, a discount code guide and a review, that repeated the same code,
prices, shipping and return terms. Since 2026-11-25 the review lives inside the guide instead:

  - the review's sections (the short answer, what the brand sells, what customers say, is it legit, is it
    worth the money, pros and cons, who it's for) go after the guide's "If the code doesn't work" list,
    starting at the heading with id="review";
  - its questions join the guide's, without the ones the guide already answers (the code, shipping,
    returns) and without questions that only repeat the price table ("How much is ...");
  - its sources join the guide's, and its "We haven't tested the products" line joins the note at the top;
  - the review page is taken out of assets/posts.js, sitemap.xml and tools/brand-names.json, and every
    link to it now points to the guide's #review section. .htaccess sends old review addresses to the
    guide (301). The file itself becomes a short "moved" page (files on Hostinger are never deleted, so
    this replaces the old copy there too).

    python3 tools/merge-review.py              # every brand that still has both pages
    python3 tools/merge-review.py niepce       # one brand (the part of the file name before -review)

new-article.py runs it after writing a review, and keeps the merged parts when it rewrites a guide.
Then it runs site-links.py, static-header.py and article-seo.py. The merged parts are marked in the
guide (data-from="review" and the "review:" comments), so running it again changes nothing.
"""
import datetime
import glob
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://kinsleydeals.com/"
NAMES = os.path.join("tools", "brand-names.json")
START = "<!-- review: merged into this guide by tools/merge-review.py -->"
END = "<!-- /review -->"
MONTHS = "January February March April May June July August September October November December".split()


def guide_of(slug):
    return f"saving-tips-{slug}-discount-code.html"


def review_of(slug):
    return f"saving-tips-{slug}-review.html"


def read(path):
    return open(os.path.join(ROOT, path), encoding="utf-8").read()


def write(path, s):
    open(os.path.join(ROOT, path), "w", encoding="utf-8").write(s)


def plain(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def amp(s):
    return re.sub(r"&(?![a-zA-Z]+;|#\d+;)", "&amp;", s)


def date_text(d):
    return f"{MONTHS[d.month - 1]} {d.day}, {d.year}"


# ---------------------------------------------------------------- reading the parts

def from_review(r, slug):
    """The parts of a review page that move into the guide."""
    guide = guide_of(slug)
    body = r[r.index('<div class="post-body">'): r.index("</article>")]
    note = re.search(r'<p class="post-note">(.*?)</p>', body, re.S).group(1)
    extra = note.split("no extra cost to you. ", 1)[1] if "no extra cost to you. " in note else ""
    extra = extra.replace("This review brings together", "Our review below brings together", 1)

    start = body.index("<!-- /toc -->") + len("<!-- /toc -->") if "<!-- /toc -->" in body else \
        re.search(r'<p class="post-note">.*?</p>', body, re.S).end()
    ends = [i for i in (body.find("<p>More brand reviews: "), body.find('<h2 id="questions-people-ask"'),
                        body.find("<h2>Questions people ask")) if i > start]
    block = body[start: min(ends)].strip()

    # Headings: ids come from article-seo.py; the first one is the target of links to the review.
    block = re.sub(r"<h2[^>]*>", "<h2>", block)
    block = block.replace("<h2>", '<h2 id="review">', 1)
    faq_html = body[body.index('<div class="faq">'):] if '<div class="faq">' in body else ""
    faq = re.findall(r"<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>", faq_html, re.S)
    sources = []
    m = re.search(r'<ul class="post-sources">(.*?)</ul>', body, re.S)
    if m:
        sources = re.findall(r"<li[^>]*>.*?</li>", m.group(1), re.S)
    parts = dict(note=extra.strip(), block=block, faq=faq, sources=sources)
    return unlink(parts, guide)


def heading_names(block, brand):
    b = amp(brand)
    names = {
        "The short answer": f"{b} review: the short answer",
        "What customers say": f"What {b} customers say",
        "Is it worth the money?": f"Is {b} worth the money?",
        "Pros and cons": f"{b} pros and cons",
        "Who it's for": f"Who {b} is for",
        "Who it&#x27;s for": f"Who {b} is for",
        "Who it’s for": f"Who {b} is for",
    }
    def swap(m):
        return f"{m.group(1)}{names.get(m.group(2), m.group(2))}</h2>"
    return re.sub(r"(<h2[^>]*>)(.*?)</h2>", swap, block)


def unlink(parts, guide):
    """Links from the review to its own guide would now point at the same page: drop or unwrap them."""
    link = r'<a href="' + re.escape(guide) + r'(?:#[^"]*)?">(.*?)</a>'
    block = re.sub(r"\s*<p>Our " + link + r"[^<]*</p>", "", parts["block"])
    parts["block"] = re.sub(link, r"\1", block)
    parts["faq"] = [(q, re.sub(r"\s*(?:See|Our) [^.<]*" + link + r"[^.<]*\.", "", a)) for q, a in parts["faq"]]
    parts["faq"] = [(q, re.sub(link, r"\1", a)) for q, a in parts["faq"]]
    return parts


def from_merged_guide(g):
    """The review parts already merged into a guide, so a rewritten guide can take them back."""
    if START not in g:
        return None
    block = g[g.index(START) + len(START): g.index(END)].strip()
    note = re.search(r'<span data-from="review">(.*?)</span>', g, re.S)
    faq = re.findall(r'<details data-from="review">\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>', g, re.S)
    sources = re.findall(r'<li data-from="review">.*?</li>', g, re.S)
    sources = [s.replace('<li data-from="review">', "<li>", 1) for s in sources]
    return dict(note=note.group(1) if note else "", block=block, faq=faq, sources=sources)


def strip_merged(g):
    """A guide without any merged review parts."""
    if START in g:
        g = re.sub(r"\s*" + re.escape(START) + r".*?" + re.escape(END), "", g, flags=re.S)
    g = re.sub(r' <span data-from="review">.*?</span>', "", g, flags=re.S)
    g = re.sub(r'\s*<details data-from="review">.*?</details>', "", g, flags=re.S)
    g = re.sub(r'\s*<li data-from="review">.*?</li>', "", g, flags=re.S)
    return g


# ---------------------------------------------------------------- questions and sources

def topic(question):
    t = plain(question).lower()
    if "code" in t and re.search(r"\bwork(ing)?\b|isn't|not accepted", t):
        return "code-fix"
    if re.search(r"\b(discount|promo|coupon) code\b|\bcoupons?\b", t) and \
            not re.search(r"student|military|nurse|teacher|first|subscri|bundle|black friday|cyber|sale", t):
        return "code"
    if re.search(r"free shipping", t):
        return "free-shipping"
    if re.search(r"how long|shipping take|arrive|delivery time", t):
        return "shipping-time"
    if re.search(r"ship (to|outside|internationally|worldwide)|deliver to|international", t):
        return "ships-to"
    if re.search(r"\breturn|refund|exchange", t):
        return "returns"
    if re.search(r"\blegit\b|scam|trustworthy", t):
        return "legit"
    return None


def repeats_page(question):
    t = plain(question).lower()
    return bool(re.search(r"promo code or (a )?coupon code|coupon code or (a )?promo code", t)) or \
        (t.startswith("how much") and "shipping" not in t)


def key(question):
    return re.sub(r"[^a-z0-9]+", "", plain(question).lower())


def merge_faq(g, review_faq):
    m = re.search(r'(\n?[ \t]*)<div class="faq">(.*?)\n[ \t]*</div>', g, re.S)
    if not m:
        return g
    own = re.findall(r"<details>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>", m.group(2), re.S)
    seen_topics, seen, items = set(), set(), []
    for q, a, src in [(q, a, "guide") for q, a in own] + [(q, a, "review") for q, a in review_faq]:
        if repeats_page(q) or key(q) in seen:
            continue
        t = topic(q)
        if t and t in seen_topics:
            continue
        seen.add(key(q))
        if t:
            seen_topics.add(t)
        attr = ' data-from="review"' if src == "review" else ""
        items.append(f"      <details{attr}>\n        <summary>{q}</summary>\n        <p>{a}</p>\n      </details>")
    new = '<div class="faq">\n' + "\n".join(items) + "\n    </div>"
    return g[: m.start()] + m.group(1) + new + g[m.end():]


def href(li):
    m = re.search(r'href="([^"]+)"', li)
    return m.group(1).split("?")[0].rstrip("/") if m else li


def merge_sources(g, review_sources):
    m = re.search(r'<ul class="post-sources">(.*?)\n[ \t]*</ul>', g, re.S)
    if not m:
        return g
    own = re.findall(r"<li[^>]*>.*?</li>", m.group(1), re.S)
    chosen = {}
    order = []
    for li, src in [(li, "guide") for li in own] + [(li, "review") for li in review_sources]:
        k = href(li)
        if k not in chosen:
            order.append(k)
            chosen[k] = (li, src)
        elif len(plain(li)) > len(plain(chosen[k][0])):
            chosen[k] = (li, src)
    items = []
    for k in order:
        li, src = chosen[k]
        if src == "review":
            li = li.replace("<li>", '<li data-from="review">', 1)
        items.append("      " + li)
    new = '<ul class="post-sources">\n' + "\n".join(items) + "\n    </ul>"
    return g[: m.start()] + new + g[m.end():]


# ---------------------------------------------------------------- putting the guide together

def apply(g, parts, slug, brand, today):
    """The guide with the review parts in it. Returns (html, minutes)."""
    g = strip_merged(g)
    review = review_of(slug)
    # The guide's own "Read our review" line points at the page being merged.
    g = re.sub(r'\n\n    <p>Not sure about [^\n]*?href="' + re.escape(review) + r'"[^\n]*?</p>', "", g)

    block = heading_names(parts["block"], brand)
    insert = f"{START}\n    {block}\n    {END}\n\n    "
    for anchor in ("<p>Shopping another brand?", '<h2 id="questions-people-ask"', "<h2>Questions people ask"):
        i = g.find(anchor)
        if i >= 0:
            g = g[:i] + insert + g[i:]
            break
    else:
        raise SystemExit(f"no place for the review in {guide_of(slug)}")

    if parts["note"]:
        g = re.sub(r'(<p class="post-note">.*?)(</p>)', lambda m: f'{m.group(1)} <span data-from="review">{parts["note"]}</span>{m.group(2)}',
                   g, count=1, flags=re.S)
    g = merge_faq(g, parts["faq"])
    g = merge_sources(g, parts["sources"])

    # Updated date and reading time
    upd = f'<span class="post-updated">Updated <time datetime="{today.isoformat()}">{date_text(today)}</time></span>'
    if 'class="post-updated"' in g:
        g = re.sub(r'<span class="post-updated">Updated <time[^>]*>[^<]*</time></span>', upd, g, count=1)
    else:
        g = re.sub(r'(<p class="post-meta"><time[^>]*>[^<]*</time>)', lambda m: m.group(1) + upd, g, count=1)
    body = g[g.index('<div class="post-body">'): g.index("</article>")]
    body = re.sub(r"<!-- toc:.*?<!-- /toc -->", "", body, flags=re.S)
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    minutes = max(3, round(words / 200))
    g = re.sub(r"<span>\d+ min read</span>", f"<span>{minutes} min read</span>", g, count=1)
    return g, minutes


# ---------------------------------------------------------------- the rest of the site

def drop_post(js, url):
    return re.sub(r"\n  \{\n    slug: [^\n]*\n    url: " + re.escape(json.dumps(url)) + r",.*?\n  \},", "", js, count=1, flags=re.S)


def set_minutes(js, url, minutes):
    m = re.search(r"  \{\n    slug: [^\n]*\n    url: " + re.escape(json.dumps(url)) + r",.*?\n  \},", js, re.S)
    if not m:
        return js
    block = re.sub(r"minutes: \d+", f"minutes: {minutes}", m.group(0))
    return js[: m.start()] + block + js[m.end():]


def site_files():
    files = glob.glob(os.path.join(ROOT, "*.html")) + glob.glob(os.path.join(ROOT, "assets", "*.js"))
    files += [os.path.join(ROOT, "tools", f) for f in ("black-friday-data.json", "black-friday-notes.json")]
    return [f for f in files if os.path.exists(f)]


def relink(slug):
    """Every link to the review now goes to the review part of the guide."""
    old, new = review_of(slug), guide_of(slug) + "#review"
    for path in site_files():
        s = open(path, encoding="utf-8").read()
        if os.path.basename(path) == guide_of(slug):
            # On the guide itself the review is a section of the same page.
            t = s.replace(f'href="{old}"', 'href="#review"').replace(f'href="{new}"', 'href="#review"')
            if t != s:
                open(path, "w", encoding="utf-8").write(t)
            continue
        if old not in s:
            continue
        t = s.replace(f'href="{old}"', f'href="{new}"').replace(old, new)
        if t != s:
            open(path, "w", encoding="utf-8").write(t)


MOVED = "<!-- moved: this review is part of the brand's discount code guide, see tools/merge-review.py -->"


def is_full_review(path):
    full = os.path.join(ROOT, path)
    return os.path.exists(full) and '<div class="post-body">' in open(full, encoding="utf-8").read()


def stub(slug, brand):
    """What stays at the old review address. Files on Hostinger are never deleted, so the old page is
    replaced by this one; .htaccess already sends visitors and Google to the guide with a 301."""
    guide = guide_of(slug)
    b = amp(brand)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{b} review | Kinsley Deals</title>
<link rel="canonical" href="{SITE}{guide}">
<meta http-equiv="refresh" content="0; url={guide}#review">
</head>
<body>
<p>Our {b} review is now part of our <a href="{guide}#review">{b} discount code guide</a>.</p>
</body>
</html>
{MOVED}
"""


def merge(slug, today, names, quiet=False):
    guide, review = guide_of(slug), review_of(slug)
    if not os.path.exists(os.path.join(ROOT, guide)):
        print(f"skip {slug}: no guide", file=sys.stderr)
        return False
    g = read(guide)
    if is_full_review(review):
        parts = from_review(read(review), slug)
    else:
        parts = from_merged_guide(g)
        if not parts:
            return False
    brand = names.get(guide) or names.get(review) or slug.replace("-", " ").title()
    new, minutes = apply(g, parts, slug, brand, today)
    write(guide, new)
    write(review, stub(slug, brand))
    js = read("assets/posts.js")
    js = set_minutes(drop_post(js, review), guide, minutes)
    write("assets/posts.js", js)
    sm = read("sitemap.xml")
    sm = re.sub(r"\n?[ \t]*<url><loc>" + re.escape(SITE + review) + r"</loc>.*?</url>", "", sm)
    sm = re.sub(r"(<loc>" + re.escape(SITE + guide) + r"</loc>)(<lastmod>[^<]*</lastmod>)?", lambda m: f"{m.group(1)}<lastmod>{today.isoformat()}</lastmod>", sm)
    write("sitemap.xml", sm)
    names.pop(review, None)
    relink(slug)
    if not quiet:
        print("merged", review, "into", guide)
    return True


def main():
    os.chdir(ROOT)
    today = datetime.date.today()
    names = json.load(open(NAMES, encoding="utf-8"))
    slugs = sys.argv[1:] or sorted(f[len("saving-tips-"): -len("-review.html")] for f in glob.glob("saving-tips-*-review.html")
                                   if is_full_review(f))
    done = [s for s in slugs if merge(s, today, names)]
    json.dump(dict(sorted(names.items())), open(NAMES, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(NAMES, "a", encoding="utf-8").write("\n")
    print(f"{len(done)} brand pages now carry their review")
    here = os.path.dirname(os.path.abspath(__file__))
    for tool in ("site-links.py", "static-header.py", "article-seo.py"):
        subprocess.run([sys.executable, os.path.join(here, tool)], check=True)


if __name__ == "__main__":
    main()
