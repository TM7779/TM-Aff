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
TAGLINE = "Discount codes for 60+ brands, from supplements and skincare to tech, toys and outdoor gear, with guides to pay less on every order."
NAV = [
    ("./", "All stores", "home"),
    ("saving-tips.html", "Saving Tips", "blog"),
    ("about.html", "About", "about"),
    ("contact.html", "Contact", "contact"),
    ("disclaimer.html", "Disclosure", "disclaimer"),
]
BRAND_MARK = (
    '<svg class="brand-mark" viewBox="3 10 59 44" aria-hidden="true"><path fill="#EF4E7B" fill-rule="evenodd" d="M20 11H53A8 8 0 0 1 61 19V45A8 8 0 0 1 53 53H20L4 35.2A4.6 4.6 0 0 1 4 28.8ZM17 27.5A4.5 4.5 0 1 0 17 36.5A4.5 4.5 0 1 0 17 27.5Z"/><path fill="#261A2E" d="M27.32 46V45.64H27.46Q28.76 45.64 29.55 44.85Q30.34 44.06 30.34 42.76V22.24Q30.34 20.94 29.55 20.15Q28.76 19.36 27.46 19.36H27.32V19H38.37V19.36H38.23Q36.93 19.36 36.14 20.15Q35.35 20.94 35.35 22.24V31.17L44.56 22.82Q46.04 21.48 46.04 20.42Q46.04 19.36 44.38 19.36H44.35V19H51.98V19.36Q51.26 19.4 50.27 19.68Q49.28 19.97 48.31 20.42Q47.34 20.87 46.65 21.48L39.02 28.5L51.8 43.84Q52.45 44.63 53.2 45.14Q53.96 45.64 54.68 45.64V46H44.02V45.64Q45.54 45.64 45.91 45.05Q46.29 44.45 45.5 43.52L35.35 31.35V42.76Q35.35 44.06 36.14 44.85Q36.93 45.64 38.23 45.64H38.37V46Z"/></svg>'
)
ICON_MENU = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" '
    'aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
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
        f'<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">{ICON_MENU}<span>Menu</span></button>'
        f'<nav class="main-nav" id="site-nav" aria-label="Main"><ul>{nav}</ul></nav>{search}</div></header>\n{END}'
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
