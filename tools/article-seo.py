"""Keeps the search-engine parts of the pages in step with what the pages show.

For every Saving Tips article it writes:
  - an id on each section heading, and an "On this page" list linking to them, under the code box;
  - the "Written by" box at the end of the article;
  - author, publisher and dateModified in the BlogPosting data (dateModified is the "Updated" date
    in the article's header, or the published date if there is none).
For every page with a "Questions people ask" list (class "faq"), it rewrites the FAQPage data from
the questions and answers on the page, so the two always match.

Run from the site folder after editing an article, its questions or a code:

    python3 tools/article-seo.py
"""

import glob
import html
import json
import re

SITE = "https://kinsleydeals.com/"
ORG = {"@type": "Organization", "name": "Kinsley Deals", "url": SITE}
AUTHOR = {"@type": "Organization", "name": "Kinsley Deals", "url": SITE + "about.html"}
AUTHOR_BOX = (
    "<!-- author: written by tools/article-seo.py -->\n"
    '    <aside class="post-author" aria-label="About this article">\n'
    "      <p><strong>Written by the Kinsley Deals team.</strong> We take prices and policies from each brand's own "
    "website, list our sources with the date we checked them, and update this article when the code changes. "
    '<a href="about.html">How we work</a></p>\n'
    "    </aside>\n"
    "    <!-- /author -->"
)
LD = re.compile(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.S)


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def slugify(s):
    s = re.sub(r"['’]", "", text(s).lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"^\d+-", "", s) or "section"


def ld_block(data):
    return '<script type="application/ld+json">\n' + json.dumps(data, indent=2, ensure_ascii=False) + "\n</script>"


def article(s):
    body_start = s.index('<div class="post-body">')
    body_end = s.index("</article>", body_start)
    body = s[body_start:body_end]

    # Heading ids
    used = set(re.findall(r'id="([^"]+)"', s))
    def add_id(m):
        if "id=" in m.group(1):
            return m.group(0)
        base = slugify(m.group(2))
        slug, n = base, 2
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        return f'<h2{m.group(1)} id="{slug}">{m.group(2)}</h2>'
    body = re.sub(r"<h2([^>]*)>(.*?)</h2>", add_id, body)

    # On this page
    heads = re.findall(r'<h2[^>]*id="([^"]+)"[^>]*>(.*?)</h2>', body)
    items = "".join(f'<li><a href="#{i}">{h}</a></li>' for i, h in heads)
    toc = (
        "<!-- toc: written by tools/article-seo.py -->\n"
        f'    <nav class="post-toc" aria-labelledby="toc-title"><p id="toc-title">On this page</p><ul>{items}</ul></nav>\n'
        "    <!-- /toc -->"
    )
    body = re.sub(r"\n\n    <!-- toc: written by tools/article-seo.py -->.*?<!-- /toc -->", "", body, flags=re.S)
    # Under the code box when it opens the article, otherwise under the note at the top.
    offer = re.search(r'<div class="post-offer".*?</div>', body, re.S)
    if not offer or offer.start() > body.find("<h2"):
        offer = re.search(r'<p class="post-note">.*?</p>', body, re.S)
    i = offer.end()
    body = body[:i] + "\n\n    " + toc + body[i:]

    # Written by
    if "<!-- author: written by tools/article-seo.py -->" in body:
        body = re.sub(r"<!-- author: written by tools/article-seo.py -->.*?<!-- /author -->", lambda _: AUTHOR_BOX, body, flags=re.S)
    else:
        body = body.rstrip()
        assert body.endswith("</div>")
        body = body[: -len("</div>")].rstrip() + "\n\n    " + AUTHOR_BOX + "\n  </div>\n"
    s = s[:body_start] + body + s[body_end:]

    # BlogPosting data
    updated = re.search(r'class="post-updated">[^<]*<time datetime="([^"]+)"', s)
    def fix(m):
        data = json.loads(m.group(1))
        if data.get("@type") != "BlogPosting":
            return m.group(0)
        data["dateModified"] = updated.group(1) if updated else data["datePublished"]
        data["author"], data["publisher"] = AUTHOR, ORG
        return ld_block(data)
    return LD.sub(fix, s)


def faq(s):
    start = s.index('<div class="faq">')
    end = s.index("</div>", start)
    pairs = re.findall(r"<summary>(.*?)</summary>\s*<p>(.*?)</p>", s[start:end], re.S)
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": text(q), "acceptedAnswer": {"@type": "Answer", "text": text(a)}}
            for q, a in pairs
        ],
    }
    found = [False]
    def swap(m):
        if json.loads(m.group(1)).get("@type") != "FAQPage":
            return m.group(0)
        found[0] = True
        return ld_block(data)
    s = LD.sub(swap, s)
    if not found[0]:
        s = s.replace("</head>", ld_block(data) + "\n</head>", 1)
    return s


for path in sorted(glob.glob("*.html")):
    s = open(path, encoding="utf-8").read()
    new = s
    if '<article class="post">' in new and '<div class="post-body">' in new:
        new = article(new)
    if '<div class="faq">' in new:
        new = faq(new)
    if new != s:
        open(path, "w", encoding="utf-8").write(new)
        print("updated", path)
