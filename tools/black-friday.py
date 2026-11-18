"""Black Friday 2026 page: scan each brand's own site, then rewrite the tables on the page.

    python3 tools/black-friday.py scan    # read every brand's home page and products.json -> tools/black-friday-data.json
    python3 tools/black-friday.py page    # rewrite the tables in saving-tips-black-friday-2026.html from that file

What it reads, for each store that has a discount code guide (assets/posts.js) and is in assets/snapshot.js:
the store's plain home page (its "website", never the affiliate link), and any text there that mentions
Black Friday, Cyber Monday, BFCM, Cyber Week or a holiday sale, from the announcement bar first. Some themes
only draw their banner with JavaScript, so a store the scan finds nothing on is worth a look in a browser.
Nothing here clicks or opens an affiliate link. A store that times out keeps its last result.

tools/black-friday-notes.json holds what a person checked on the brand's site, in plain words: "offer" (""
hides a misleading scrap, such as last year's banner), "extra" (a sentence shown after it) and
"black_friday": true for a sale announced without a discount yet. Its entries win over the scan; a scanned
text with no note is shown in quotes until someone writes one.
"""
import html, json, os, re, sys, time, urllib.request, urllib.error
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "black-friday-data.json")
NOTES = os.path.join(ROOT, "tools", "black-friday-notes.json")
PAGE = os.path.join(ROOT, "saving-tips-black-friday-2026.html")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
WORDS = re.compile(r"black\s*friday|cyber\s*monday|cyber\s*week|bfcm|holiday\s+sale|early\s+access|biggest\s+sale\s+of\s+the\s+year", re.I)
CATS = [("vitamins-supplements", "Vitamins and supplements"), ("skincare-beauty", "Beauty and skincare"),
        ("clothing-accessories", "Clothing, bags and accessories"), ("electronics", "Electronics and gadgets"),
        ("home-garden", "Home and kitchen"), ("toys-kids", "Toys, kids and baby"),
        ("sports-outdoors", "Sports, outdoors and boating"), ("food-drink", "Food and drink")]


def load_js_object(path, name):
    s = open(os.path.join(ROOT, path), encoding="utf-8").read()
    m = re.search(name + r"\s*=\s*(\{.*\});", s, re.S)
    return json.loads(m.group(1))


def stores_with_guides():
    snap = load_js_object("assets/snapshot.js", r"window\.STORE_SNAPSHOT")["stores"]
    posts = open(os.path.join(ROOT, "assets/posts.js"), encoding="utf-8").read()
    guides = {}
    for m in re.finditer(r'url: "(saving-tips-[a-z0-9-]+-discount-code\.html)"[\s\S]*?store: "([^"]+)"', posts):
        guides.setdefault(m.group(2), m.group(1))
    return [dict(s, guide=guides[s["slug"]]) for s in snap if s["slug"] in guides]


def get(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore"), r.headers.get("Content-Type", "")


def visible_text(h):
    h = re.sub(r"<(script|style|noscript|template|svg)\b.*?</\1>", " ", h, flags=re.S | re.I)
    return h


def clean(t):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t).strip(" |•·-–—:")


def offers_from_home(h):
    h = visible_text(h)
    found = []
    # announcement bars first
    for m in re.finditer(r'<(div|p|a|span|section)[^>]*(?:class|id)="[^"]*announcement[^"]*"[^>]*>(.*?)</\1>', h, re.S | re.I):
        t = clean(m.group(2))
        if t and WORDS.search(t) and len(t) < 220:
            found.append(t)
    if not found:
        text = clean(h)
        for m in WORDS.finditer(text):
            a, b = max(0, m.start() - 70), min(len(text), m.end() + 90)
            found.append(text[a:b].strip())
    out = []
    for t in found:
        t = t[:160]
        if t.lower() not in [o.lower() for o in out]:
            out.append(t)
    return out[:3]



def scan():
    old = json.load(open(DATA)) if os.path.exists(DATA) else {"stores": {}}
    out = {"checked": date.today().isoformat(), "stores": {}}
    for s in stores_with_guides():
        site = s["website"].rstrip("/")
        prev = old["stores"].get(s["slug"], {})
        rec = {"name": s["name"], "website": site, "category": s["category"], "guide": s["guide"], "checked": out["checked"]}
        try:
            h, _ = get(site + "/")
            rec["offers"] = offers_from_home(h)
        except Exception as e:  # keep the last result, marked as not rechecked
            rec.update(offers=prev.get("offers", []), checked=prev.get("checked"), error=f"home: {e}"[:120])
            out["stores"][s["slug"]] = rec
            print(f"{s['slug']:20} home failed: {e}")
            time.sleep(1)
            continue
        out["stores"][s["slug"]] = rec
        print(f"{s['slug']:20} {rec['offers'][:1]}")
        time.sleep(1)
    json.dump(out, open(DATA, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", DATA)


def page():
    data = json.load(open(DATA, encoding="utf-8"))
    notes = json.load(open(NOTES, encoding="utf-8")) if os.path.exists(NOTES) else {}
    snap = {s["slug"]: s for s in load_js_object("assets/snapshot.js", r"window\.STORE_SNAPSHOT")["stores"]}
    esc = lambda t: html.escape(t, quote=True)
    rows_by_cat, n_bf = {}, 0
    for slug, r in data["stores"].items():
        st = snap.get(slug)
        if not st:
            continue
        note = notes.get(slug, {})
        offer, quoted = note.get("offer"), False
        if offer is None and r.get("offers"):
            offer, quoted = r["offers"][0], True
        offer = offer or ""
        bf = bool(offer and WORDS.search(offer)) or bool(note.get("black_friday"))
        coupon = (st.get("coupons") or [{}])[0]
        code, pct = coupon.get("code", ""), coupon.get("discount", "")
        n_bf += bf
        offer_html = (f"&ldquo;{esc(offer)}&rdquo;" if quoted else esc(offer)) if offer else "No Black Friday offer on its home page yet."
        if note.get("extra"):
            offer_html += " " + esc(note["extra"])
        code_html = (f'<strong data-code="{slug}">{esc(code)}</strong> (<span data-discount="{slug}">{esc(pct)}</span> off)' if code else "&ndash;")
        row = (f'          <tr><td><a href="{r["guide"]}">{esc(st["name"])}</a><br>'
               f'<a data-shop="{slug}" href="{esc(st["url"])}" target="_blank" rel="sponsored nofollow noopener">Shop &rarr;</a></td>'
               f'<td>{offer_html}</td><td>{code_html}</td></tr>')
        rows_by_cat.setdefault(r["category"], []).append((not bf, st["name"].lower(), row))
    parts = []
    for cat, label in CATS:
        rows = rows_by_cat.get(cat)
        if not rows:
            continue
        rows.sort()
        cid = "deals-" + cat
        parts.append(f'    <h2 id="{cid}">{label}</h2>\n    <div class="post-table-wrap">\n      <table class="post-table">\n'
                     '        <thead><tr><th scope="col">Brand</th><th scope="col">Black Friday offer on its site</th>'
                     '<th scope="col">Our code</th></tr></thead>\n        <tbody>\n'
                     + "\n".join(r[2] for r in rows) + "\n        </tbody>\n      </table>\n    </div>\n")
    checked = date.fromisoformat(data["checked"])
    when = checked.strftime("%B %-d, %Y")
    block = (f'    <p class="post-small" id="bf-checked">Checked on <time datetime="{data["checked"]}">{when}</time> on each brand\'s own site. '
             f'{n_bf} of {len(data["stores"])} brands showed a Black Friday offer on their home page.</p>\n\n'
             + "\n".join(parts))
    s = open(PAGE, encoding="utf-8").read()
    s, n = re.subn(r"(<!-- bf-tables -->\n).*?(    <!-- /bf-tables -->)", lambda m: m.group(1) + block + m.group(2), s, flags=re.S)
    assert n == 1, "markers not found"
    s = re.sub(r'<span data-bf="count">\d+</span>', f'<span data-bf="count">{n_bf}</span>', s)
    s = re.sub(r'<span data-bf="total">\d+</span>', f'<span data-bf="total">{len(data["stores"])}</span>', s)
    open(PAGE, "w", encoding="utf-8").write(s)
    print(f"page: {n_bf} of {len(data['stores'])} brands with a Black Friday offer, checked {when}")


if __name__ == "__main__":
    {"scan": scan, "page": page}[sys.argv[1] if len(sys.argv) > 1 else "scan"]()
