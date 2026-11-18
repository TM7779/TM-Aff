"""Put the current month in the <title> of every discount code guide, as coupon sites do:
"Mizu Lab Discount Code 2026: 10% Off" -> "Mizu Lab Discount Code November 2026: 10% Off".

    python3 tools/title-month.py            # this month
    python3 tools/title-month.py 2026-12    # a given month

Run it on the 1st of each month. It changes only the title tag (and title_tag in the guide's spec, so
new-article.py keeps it), never the "Updated" date: the month says the code list is current, and the
daily sheet check keeps it so. A title longer than 66 characters drops " | Kinsley Deals" so the
month and discount stay in what Google shows.
"""
import glob, html, json, os, re, sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONTHS = "January February March April May June July August September October November December".split()
SUFFIX = " | Kinsley Deals"


def month_label(arg=None):
    d = date.fromisoformat(arg + "-01") if arg else date.today()
    return f"{MONTHS[d.month - 1]} {d.year}"


def retitle(title, label):
    base = title[: -len(SUFFIX)] if title.endswith(SUFFIX) else title
    if re.search(r"\b(" + "|".join(MONTHS) + r") 20\d\d\b", base):
        base = re.sub(r"\b(" + "|".join(MONTHS) + r") 20\d\d\b", label, base, count=1)
    elif re.search(r"\b20\d\d\b", base):
        base = re.sub(r"\b20\d\d\b", label, base, count=1)
    else:
        return title
    return base + SUFFIX if len(base + SUFFIX) <= 66 else base


def main():
    label = month_label(sys.argv[1] if len(sys.argv) > 1 else None)
    changed = 0
    for path in sorted(glob.glob(os.path.join(ROOT, "saving-tips-*-discount-code.html"))):
        s = open(path, encoding="utf-8").read()
        m = re.search(r"<title>(.*?)</title>", s, re.S)
        old = html.unescape(m.group(1).strip())
        new = retitle(old, label)
        if new == old:
            continue
        s = s[: m.start()] + "<title>" + html.escape(new, quote=False) + "</title>" + s[m.end():]
        open(path, "w", encoding="utf-8").write(s)
        spec = os.path.join(ROOT, "tools/article-examples", os.path.basename(path)[len("saving-tips-"):-5] + ".json")
        if os.path.exists(spec):
            j = json.load(open(spec, encoding="utf-8"))
            j["title_tag"] = new
            json.dump(j, open(spec, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
            open(spec, "a").write("\n")
        changed += 1
        print(f"{len(new):3}  {new}")
    print(f"{changed} titles set to {label}")


if __name__ == "__main__":
    main()
