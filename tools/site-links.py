"""Internal links between articles, as the SEO course teaches them (PageRank is split between a page's
links, so each page links to a few close pages, and one hub page links to everything):

  - every brand's page (its discount code guide, which also carries its review since 2026-11-25, see
    tools/merge-review.py) ends with "Shopping another brand?" naming 4 other brands: the same kind of
    store first (category in the sheet), taken in turn after the page's own brand in A-Z order so every
    page gets about the same number of links; then a link to the A-Z list;
  - saving-tips.html carries that A-Z list of every brand page and buying guide in its HTML, so Google
    finds them all without pressing "Show more tips".

    python3 tools/site-links.py

new-article.py runs it after writing an article. Link text is the brand's name from tools/brand-names.json
(article file -> name); new-article.py adds new brands to it.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMES = os.path.join(ROOT, "tools", "brand-names.json")
PER_PAGE = 4
KINDS = {
    "coupon-guides": dict(
        intro="Shopping another brand? See our discount code guides for ",
        outro=', or find any brand in our <a href="saving-tips.html#all-guides">A–Z list of brands</a>.'),
}
HUB_START = "<!-- az: written by tools/site-links.py -->"
HUB_END = "<!-- /az -->"


def read(path):
    return open(os.path.join(ROOT, path), encoding="utf-8").read()


def write(path, text):
    open(os.path.join(ROOT, path), "w", encoding="utf-8").write(text)


def amp(s):
    return re.sub(r"&(?![a-zA-Z]+;|#\d+;)", "&amp;", s)


def join_and(items):
    return items[0] if len(items) == 1 else ", ".join(items[:-1]) + " and " + items[-1]


def load_posts():
    js = read("assets/posts.js")
    posts = []
    for block in re.findall(r"  \{\n(.*?)\n  \},", js, re.S):
        get = lambda key: (re.search(rf'^    {key}: "([^"]*)"', block, re.M) or [None, None])[1]
        posts.append(dict(url=get("url"), title=json.loads('"' + (get("title") or "") + '"'),
                          category=get("category"), store=get("store")))
    return [p for p in posts if p["url"]]


def store_categories():
    text = read("assets/snapshot.js")
    data = json.loads(text[text.index("{"): text.rindex("}") + 1])
    return {s["slug"]: s.get("category") for s in data["stores"]}


def sort_key(name):
    return name.lower().replace("&", "and")


def related(page_url, page_store, page_cat, items, cats, names):
    """Up to PER_PAGE other articles: the brand's own article of this kind (on a buying guide), three of
    the same category, and the next brand in A-Z order from another category, so brands in small
    categories get links too. Each list is taken in turn after the page's own name."""
    def ring(pool):
        pool = sorted(pool, key=lambda p: sort_key(names[p["url"]]))
        me = sort_key(names.get(page_url, ""))
        after = [p for p in pool if sort_key(names[p["url"]]) > me]
        before = [p for p in pool if sort_key(names[p["url"]]) <= me]
        return [p for p in after + before if p["url"] != page_url]
    own = [p for p in items if p["store"] == page_store and p["url"] != page_url]
    same = ring([p for p in items if cats.get(p["store"]) == page_cat and p not in own])
    other = ring([p for p in items if cats.get(p["store"]) != page_cat])
    picks = own[:1] + same[: PER_PAGE - 1 - len(own[:1])] + other[:1]
    for p in same + other:
        if len(picks) >= PER_PAGE:
            break
        if p not in picks:
            picks.append(p)
    return picks[:PER_PAGE]


def main():
    names = json.load(open(NAMES, encoding="utf-8"))
    posts = load_posts()
    cats = store_categories()
    by_url = {p["url"]: p for p in posts}
    changed = 0
    for kind, k in KINDS.items():
        items = [p for p in posts if p["category"] == kind and p["url"] in names]
        pat = re.compile(r"<p>" + re.escape(k["intro"]) + r".*?</p>", re.S)
        for path in sorted(f for f in os.listdir(ROOT) if f.startswith("saving-tips-") and f.endswith(".html")):
            s = read(path)
            if not pat.search(s):
                continue
            me = by_url.get(path) or {}
            picks = related(path, me.get("store"), cats.get(me.get("store")), items, cats, names)
            if not picks:
                continue
            links = [f'<a href="{p["url"]}">{amp(names[p["url"]])}</a>' for p in picks]
            new = pat.sub(lambda _: f"<p>{k['intro']}{join_and(links)}{k['outro']}</p>", s, count=1)
            if new != s:
                write(path, new)
                changed += 1
    print(f"related links rewritten on {changed} articles")

    def az(kind, label=None):
        rows = [p for p in posts if p["category"] == kind]
        rows.sort(key=lambda p: sort_key(label(p) if label else names.get(p["url"], p["title"])))
        return "".join(f'<li><a href="{p["url"]}">{amp(label(p) if label else names.get(p["url"], p["title"]))}</a></li>' for p in rows)

    hub = (
        f"{HUB_START}\n"
        '<section class="section az" aria-labelledby="az-title" data-keep>\n'
        '  <div class="wrap">\n'
        '    <h2 id="az-title">Every article, A–Z</h2>\n'
        '    <h3 id="all-guides">Brands: discount codes and reviews</h3>\n'
        f'    <ul class="az-list">{az("coupon-guides")}</ul>\n'
        '    <h3 id="all-buying">Buying guides</h3>\n'
        f'    <ul class="az-list wide">{az("buying-guides", label=lambda p: p["title"])}</ul>\n'
        "  </div>\n"
        "</section>\n"
        f"{HUB_END}"
    )
    s = read("saving-tips.html")
    block = re.compile(re.escape(HUB_START) + r".*?" + re.escape(HUB_END), re.S)
    new = block.sub(lambda _: hub, s) if block.search(s) else re.sub(r'<main id="main">\s*</main>', f'<main id="main">\n{hub}\n</main>', s)
    if new != s:
        write("saving-tips.html", new)
        print("updated saving-tips.html A–Z list")


if __name__ == "__main__":
    main()
