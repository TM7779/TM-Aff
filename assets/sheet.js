/*
 * Loads stores, codes and products from the published "Web" tab of the Google Sheet (SITE.sheet).
 * That tab mirrors the sheet's own tabs with formulas: store columns on the left, product columns
 * from the "Cửa hàng" header onwards. Columns are matched by header text, so their order can change.
 *
 * Anything the sheet leaves empty is filled from STORES in data.js (matched by store name and product
 * link), then from the store's Shopify product data, then with a plain fallback.
 * If the sheet can't be reached, the last good copy (or data.js) is used.
 */

(function () {
  const CACHE_KEY = "nb-sheet-stores-v1";
  const PRODUCT_CACHE_KEY = "nb-shopify-v1";
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

  // Product links get the same ref parameters as the store's affiliate link (when both are on one site).
  function withRef(link, affiliate) {
    const p = toURL(link);
    const a = toURL(affiliate);
    if (!p) return link;
    if (a && siteOf(a.hostname) === siteOf(p.hostname)) {
      a.searchParams.forEach((value, key) => {
        if (!p.searchParams.has(key)) p.searchParams.set(key, value);
      });
    }
    return p.toString();
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
            category: k.category || "health-beauty",
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
        if (get("cover")) set("cover", get("cover")) && (store.coverZoom = undefined);
        const cat = CATEGORIES.find((c) => norm(c.name) === norm(get("category")) || c.slug === get("category"));
        if (cat) set("category", cat.slug);
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
        const out = { ...s, website };
        if (!out.about) out.about = `Coupon codes and deals for ${s.name}.`;
        delete out.known;
        Object.keys(out).forEach((key) => key.startsWith("_") && delete out[key]);
        return out;
      });
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
    for (const store of stores) {
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
