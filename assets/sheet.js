/*
 * Loads stores, codes and products from the published "Web" tab of the Google Sheet (SITE.sheet).
 * That tab mirrors the sheet's own tabs with formulas: store columns on the left, product columns
 * from the "Cửa hàng" header onwards. Columns are matched by header text, so their order can change.
 *
 * Anything the sheet leaves empty is filled from STORES in data.js (matched by store name and product
 * link), then from the store's Shopify data (shop name and description, product names and photos),
 * then with a plain fallback. Stores without a category in the sheet are sorted by keyword (see data.js).
 * If the sheet can't be reached, the last good copy (or data.js) is used.
 */

(function () {
  const CACHE_KEY = "nb-sheet-stores-v3";
  const PRODUCT_CACHE_KEY = "nb-shopify-v1";
  const META_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  const PALETTE = ["#1F6F8B", "#2F5D46", "#7A4B00", "#6B3FD1", "#B43C62", "#3E5C76"];

  const STORE_COLUMNS = {
    name: "ten cua hang",
    website: "website",
    url: "link affiliate",
    category: "nganh hang",
    status: "trang thai",
    code: "ma coupon",
    discount: "muc giam",
    expires: "ngay het han",
    verified: "da kiem tra",
    details: "dieu kien",
    deal: "uu dai",
    about: "mo ta",
    logo: "link logo",
    cover: "link anh bia",
  };
  const PRODUCT_COLUMNS = { store: "cua hang", url: "link san pham", name: "ten san pham", image: "link anh" };
  // Filled by an IMPORTXML formula on the Web tab: the icon link found on the store's home page.
  const AUTO_LOGO_COLUMN = "logo tu dong";

  // "Tên cửa hàng *" -> "ten cua hang"
  function norm(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/\(.*?\)|\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') {
          field += '"';
          i++;
        } else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else field += ch;
    }
    if (field || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function toURL(s) {
    try {
      return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    } catch {
      return null;
    }
  }
  const siteOf = (host) => host.replace(/^www\./, "").split(".").slice(-2).join(".");

  // "www.maryruthorganics.com" -> "Maryruthorganics"
  function nameFromLink(link) {
    const u = toURL(link);
    if (!u) return "";
    const label = u.hostname.replace(/^(www|shop|store)\./, "").split(".")[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  // "15$" -> "$15", "15" -> "15%", "0.15" -> "15%", "10% off" -> "10%"
  function normDiscount(raw) {
    const s = raw.replace(/\s+/g, "").replace(/off$/i, "");
    let m;
    if ((m = s.match(/^(\d+(?:[.,]\d+)?)%$/))) return `${m[1].replace(",", ".")}%`;
    if ((m = s.match(/^([$€£])(\d+(?:[.,]\d+)?)$/))) return m[1] + m[2];
    if ((m = s.match(/^(\d+(?:[.,]\d+)?)([$€£]|usd)$/i))) return (m[2].toLowerCase() === "usd" ? "$" : m[2]) + m[1];
    if ((m = s.match(/^0?[.,](\d+)$/))) return `${Math.round(parseFloat(`0.${m[1]}`) * 100)}%`;
    if (/^\d+$/.test(s)) return `${s}%`;
    return raw.trim();
  }
  const isAmount = (d) => /^[$€£]?\d+(\.\d+)?%?$/.test(d);

  // dd/mm/yyyy (the sheet's format) or yyyy-mm-dd -> yyyy-mm-dd
  function parseDate(s) {
    let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    if ((m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/))) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return "";
  }

  // "Free shipping on US orders over $20" -> "Free ship"; "20% off sitewide" -> "20%"
  function dealLabel(text) {
    if (/free\s*ship/i.test(text)) return "Free ship";
    const m = text.match(/[$€£]\d+(?:\.\d+)?|\d+(?:\.\d+)?%/);
    return m ? m[0] : "Deal";
  }

  // Every way to the shop goes through the affiliate link. A product link gets the affiliate link's
  // ref parameters (?sca_ref=…) when it has some; when the ref is in the path instead (/CODE) or on
  // another site, it can't be carried over, so the product opens the affiliate link itself.
  function withRef(link, affiliate) {
    const p = toURL(link);
    const a = toURL(affiliate);
    if (!p || !a) return link;
    const samePage = a.origin === p.origin && a.pathname.replace(/\/$/, "") === p.pathname.replace(/\/$/, "");
    if (siteOf(a.hostname) !== siteOf(p.hostname) || (![...a.searchParams.keys()].length && !samePage)) return a.toString();
    a.searchParams.forEach((value, key) => {
      if (!p.searchParams.has(key)) p.searchParams.set(key, value);
    });
    return p.toString();
  }

  // A logo for stores with none: the icon from the store's home page (Shopify ones asked for at full
  // size), else Google's copy of the site icon. A 404 there leaves the coloured monogram showing.
  function iconFor(found, website) {
    const site = toURL(website);
    if (found && site && /^(https?:)?\//.test(found)) {
      try {
        const u = new URL(found.startsWith("//") ? `https:${found}` : found, site.origin);
        if (/\/cdn\/shop\/|cdn\.shopify\.com/.test(u.href)) {
          ["crop", "height", "width"].forEach((k) => u.searchParams.delete(k));
          // Older Shopify themes put the size in the file name: logo_32x32.png
          u.pathname = u.pathname.replace(/_(\d+x\d*|x\d+)(?=\.\w+$)/, "");
        }
        return u.href.replace(/^http:/, "https:");
      } catch {}
    }
    if (!site) return "";
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=128&url=${encodeURIComponent(site.origin)}`;
  }

  function columnsFor(head, spec, from, to) {
    const out = {};
    for (const [key, label] of Object.entries(spec)) {
      const i = head.findIndex((h, idx) => idx >= from && idx < to && h.startsWith(label));
      if (i >= 0) out[key] = i;
    }
    return out;
  }

  function buildStores(rows, known) {
    const head = (rows[0] || []).map(norm);
    const productStart = head.indexOf(PRODUCT_COLUMNS.store);
    const sc = columnsFor(head, STORE_COLUMNS, 0, productStart >= 0 ? productStart : head.length);
    const pc = productStart >= 0 ? columnsFor(head, PRODUCT_COLUMNS, productStart, head.length) : {};
    const autoLogoCol = head.indexOf(AUTO_LOGO_COLUMN);
    const knownBySlug = new Map(known.map((s) => [s.slug, s]));
    const stores = [];
    const bySlug = new Map();
    let current = null;

    for (const row of rows.slice(1)) {
      const get = (key) => (sc[key] >= 0 ? String(row[sc[key]] || "").trim() : "");
      const name = get("name");
      const url = get("url");
      if (name || url) {
        const slug = slugify(name || nameFromLink(url));
        if (!slug) continue;
        let store = bySlug.get(slug);
        if (!store) {
          const k = knownBySlug.get(slug) || {};
          store = {
            slug,
            name: name || k.name || nameFromLink(url),
            nameFromLink: !name && !k.name,
            category: k.category || "",
            url: k.url || "",
            website: "",
            logo: k.logo || "",
            color: k.color || PALETTE[stores.length % PALETTE.length],
            cover: k.cover || "",
            coverZoom: k.coverZoom,
            about: k.about || "",
            coupons: [],
            products: [],
            known: k,
          };
          bySlug.set(slug, store);
          stores.push(store);
        }
        // A store's first row with a value wins; later rows only add codes.
        const set = (field, value) => value && !store[`_${field}`] && ((store[field] = value), (store[`_${field}`] = true));
        set("url", url);
        set("website", get("website"));
        set("about", get("about"));
        set("logo", get("logo"));
        if (autoLogoCol >= 0 && !store.foundIcon) store.foundIcon = String(row[autoLogoCol] || "").trim();
        if (get("cover")) set("cover", get("cover")) && (store.coverZoom = undefined);
        // "Tự động", empty or an old category name: sorted automatically later.
        const cat = CATEGORIES.find((c) => norm(c.name) === norm(get("category")) || c.slug === get("category"));
        if (cat && set("category", cat.slug)) store.categoryFixed = true;
        if (norm(get("status")).startsWith("tam dung")) store.paused = true;
        current = store;
      } else if (!get("code") && !get("deal")) {
        continue;
      }
      // Rows with only a code (no store name or link) belong to the store above them.
      if (current) addOffers(current, get);
    }

    for (const row of rows.slice(1)) {
      if (pc.store === undefined || pc.url === undefined) break;
      const store = bySlug.get(slugify(row[pc.store] || ""));
      const link = String(row[pc.url] || "").trim();
      if (!store || !toURL(link)) continue;
      const path = toURL(link).pathname.replace(/\/$/, "");
      const k = (store.known.products || []).find((p) => toURL(p.url) && toURL(p.url).pathname.replace(/\/$/, "") === path) || {};
      store.products.push({
        name: String(row[pc.name] || "").trim() || k.name || "",
        image: String(row[pc.image] || "").trim() || k.image || "",
        url: withRef(link, store.url),
      });
    }

    return stores
      .filter((s) => !s.paused && s.url)
      .map((s) => {
        const website = s.website || (toURL(s.url) ? toURL(s.url).origin : "");
        const out = { ...s, website, logo: s.logo || iconFor(s.foundIcon, website) };
        delete out.known;
        delete out.foundIcon;
        Object.keys(out).forEach((key) => key.startsWith("_") && delete out[key]);
        return out;
      });
  }

  // The category whose words appear most often. Name, description and shop description count double.
  function classify(store, meta) {
    const strong = norm([store.name, store.about, meta && meta.description].join(" "));
    const weak = norm([...store.products.map((p) => p.name), ...store.coupons.map((c) => c.title)].join(" "));
    let best = "";
    let bestScore = 0;
    for (const cat of CATEGORIES) {
      if (!cat.words || !cat.words.length) continue;
      const re = new RegExp(`\\b(${cat.words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(s|es)?\\b`, "g");
      const score = (strong.match(re) || []).length * 2 + (weak.match(re) || []).length;
      if (score > bestScore) {
        best = cat.slug;
        bestScore = score;
      }
    }
    return best;
  }

  // First sentence or two of a shop description, for stores the sheet doesn't describe.
  function shortAbout(text) {
    const sentences = String(text || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*/g) || [];
    let out = "";
    for (const s of sentences) {
      if (out && (out + s).length > 200) break;
      out += s;
    }
    return out.trim();
  }

  function addOffers(store, get) {
    const host = (toURL(store.website || store.url) || { hostname: "" }).hostname.replace(/^www\./, "");
    const code = get("code");
    if (code) {
      const discount = get("discount") ? normDiscount(get("discount")) : "Save";
      store.coupons.push({
        title: isAmount(discount) ? `${discount} off your order` : `Discount code for ${store.name}`,
        discount,
        code,
        expires: parseDate(get("expires")),
        verified: norm(get("verified")).startsWith("da xac nhan"),
        details:
          get("details") ||
          `Enter ${code} in the discount box at checkout on ${host}${isAmount(discount) ? ` to take ${discount} off your order` : ""}.`,
      });
    }
    const deal = get("deal");
    if (deal) {
      store.coupons.push({ title: deal, discount: dealLabel(deal), code: "", expires: "", verified: false, details: `${deal}. No code needed.` });
    }
  }

  /* ---------- Shopify fill-ins for products and covers the sheet leaves empty ---------- */

  function readCache(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }
  function writeCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  async function getJSON(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      return res.ok ? await res.json() : null;
    } finally {
      clearTimeout(timer);
    }
  }

  const httpsImage = (src) => (src && src.startsWith("//") ? `https:${src}` : src || "");

  async function fillFromShopify(stores) {
    const cache = readCache(PRODUCT_CACHE_KEY) || {};
    const jobs = [];
    const metas = new Map();
    for (const store of stores) {
      // Shop name and description from Shopify's small meta.json, kept for a week.
      const origin = (toURL(store.website) || {}).origin;
      if (origin) {
        const key = `meta:${origin}`;
        if (cache[key] && Date.now() - cache[key].at < META_MAX_AGE) metas.set(store, cache[key]);
        else
          jobs.push(
            getJSON(`${origin}/meta.json`, 3000)
              .then((d) => d && (cache[key] = { name: d.name || "", description: d.description || "", at: Date.now() }))
              .catch(() => {})
              .then(() => cache[key] && metas.set(store, cache[key]))
          );
      }
      for (const p of store.products) {
        if (p.name && p.image) continue;
        const u = toURL(p.url);
        const handle = u && (u.pathname.match(/\/products\/([^/]+)/) || [])[1];
        if (!handle) continue;
        const key = `${u.origin}/products/${handle}`;
        const apply = (info) => {
          if (!info) return;
          p.name = p.name || info.name;
          p.image = p.image || info.image;
        };
        if (cache[key]) apply(cache[key]);
        else
          jobs.push(
            getJSON(`${key}.js`, 3000)
              .then((d) => d && (cache[key] = { name: d.title, image: httpsImage(d.featured_image) }))
              .then(() => apply(cache[key]))
              .catch(() => {})
          );
      }
      if (!store.cover && !store.products.some((p) => p.image) && store.website) {
        const key = `cover:${store.website}`;
        if (cache[key]) store.cover = cache[key];
        else
          jobs.push(
            getJSON(`${store.website.replace(/\/$/, "")}/products.json?limit=1`, 3000)
              .then((d) => {
                const src = d && d.products && d.products[0] && d.products[0].images[0];
                if (src) store.cover = cache[key] = src.src;
              })
              .catch(() => {})
          );
      }
    }
    await Promise.all(jobs);
    writeCache(PRODUCT_CACHE_KEY, cache);
    for (const store of stores) {
      for (const p of store.products) {
        if (!p.name) {
          const handle = ((toURL(p.url) || { pathname: "" }).pathname.match(/\/products\/([^/]+)/) || [])[1] || "";
          p.name = handle.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || store.name;
        }
      }
      if (!store.cover) store.cover = (store.products.find((p) => p.image) || {}).image || "";
      const meta = metas.get(store);
      if (store.nameFromLink && meta && meta.name) store.name = meta.name;
      if (!store.about) store.about = shortAbout(meta && meta.description) || `Coupon codes and deals for ${store.name}.`;
      if (!store.categoryFixed) store.category = classify(store, meta) || store.category || CATEGORIES[CATEGORIES.length - 1].slug;
      delete store.nameFromLink;
      delete store.categoryFixed;
    }
  }

  /* ---------- Entry point used by app.js ---------- */

  // Resolves to the sheet's stores, or null to keep data.js. `fetchSheet: false` only reads the cache.
  window.loadSheetStores = async function ({ fetchSheet = true } = {}) {
    const cached = readCache(CACHE_KEY);
    if (!SITE.sheet || !fetchSheet) return cached && cached.stores;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      // A new URL each minute so the browser doesn't hold on to an old copy for long.
      const sep = SITE.sheet.includes("?") ? "&" : "?";
      const res = await fetch(`${SITE.sheet}${sep}t=${Math.floor(Date.now() / 60000)}`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Sheet returned ${res.status}`);
      const stores = buildStores(parseCSV(await res.text()), STORES);
      if (!stores.length) throw new Error("Sheet has no stores");
      await fillFromShopify(stores);
      writeCache(CACHE_KEY, { at: Date.now(), stores });
      return stores;
    } catch (err) {
      console.warn("Using saved store data:", err.message);
      return cached && cached.stores;
    }
  };
})();
