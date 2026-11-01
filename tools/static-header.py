"""Writes the site header (and the home page hero text) into the HTML pages.

The header used to be drawn by assets/app.js, which pushed the page down once the scripts ran.
Now each page carries the same markup renderHeader() would draw, and app.js leaves it alone.
Run from the site folder after changing the site name, the menu or SITE.tagline:

    python3 tools/static-header.py
"""

import glob
import re

SITE_NAME = "Kinsley Deals"
# Same as SITE.tagline in assets/data.js.
TAGLINE = "Discount codes for supplement and wellness brands like Heights, MaryRuth's and BodyBio, with guides to pay less on every order."
NAV = [
    ("./", "All stores", "home"),
    ("saving-tips.html", "Saving Tips", "blog"),
    ("about.html", "About", "about"),
    ("contact.html", "Contact", "contact"),
    ("disclaimer.html", "Disclosure", "disclaimer"),
]
BRAND_MARK = (
    '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path fill="#EF4E7B" '
    'd="M16 1c1.2 7.6 7.4 13.8 15 15-7.6 1.2-13.8 7.4-15 15-1.2-7.6-7.4-13.8-15-15C8.6 14.8 14.8 8.6 16 1Z"/></svg>'
)
ICON_SEARCH = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    'aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
)

START = "<!-- header: written by tools/static-header.py -->"
END = "<!-- /header -->"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#39;")


def header(page):
    section = "blog" if page == "post" else page
    current = ' aria-current="page"'
    nav = "".join(
        f'<li class="nav-{key}"><a href="{href}"{current if key == section else ""}>{label}</a></li>'
        for href, label, key in NAV
    )
    search = (
        ""
        if page == "home"
        else '<form class="header-search" action="./" role="search"><label class="search">'
        + ICON_SEARCH
        + '<span class="skip">Search stores</span>'
        '<input type="search" name="q" placeholder="Search stores and products" autocomplete="off"></label></form>'
    )
    return (
        f'{START}\n<a class="skip" href="#main">Skip to content</a>\n'
        f'<header class="site-header"><div class="wrap">'
        f'<a class="brand" href="./">{BRAND_MARK}<span>{esc(SITE_NAME)}</span></a>'
        f'<nav class="main-nav" aria-label="Main"><ul>{nav}</ul></nav>{search}</div></header>\n{END}'
    )


# The home hero's text and search box, as renderHome() draws them; the tickets are added by app.js.
HERO = (
    '<!-- hero: written by tools/static-header.py -->\n'
    '<section class="hero"><div class="wrap"><div>'
    '<h1>Self-care, for less.</h1>'
    f'<p>{esc(TAGLINE)}</p>'
    '<form role="search" onsubmit="return false"><label class="search">'
    + ICON_SEARCH
    + '<span class="skip">Search stores and products</span>'
    '<input id="q" type="search" placeholder="Search" autocomplete="off" value=""></label></form>'
    '</div><div class="ticket-fan"></div></div></section>\n'
    '<!-- /hero -->'
)

for path in sorted(glob.glob("*.html")):
    html = open(path, encoding="utf-8").read()
    m = re.search(r'<body data-page="([^"]+)"', html)
    if not m:
        continue
    page = m.group(1)
    block = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    new = block.sub(lambda _: header(page), html) if block.search(html) else html.replace('<div id="header"></div>', header(page))
    if page == "home":
        hero = re.compile(r"<!-- hero: written by tools/static-header.py -->.*?<!-- /hero -->", re.S)
        new = hero.sub(lambda _: HERO, new) if hero.search(new) else re.sub(r'<main id="main">\s*</main>', f'<main id="main">\n{HERO}\n</main>', new)
    if new != html:
        open(path, "w", encoding="utf-8").write(new)
        print("updated", path)
