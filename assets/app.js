/* Renders every page from the Google Sheet (via sheet.js), falling back to data.js.
   Each HTML file sets <body data-page="...">. */

(function () {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  const ICON_SEARCH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  // A four-point "nova" star.
  const BRAND_MARK =
    '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path fill="#EF4E7B" d="M16 1c1.2 7.6 7.4 13.8 15 15-7.6 1.2-13.8 7.4-15 15-1.2-7.6-7.4-13.8-15-15C8.6 14.8 14.8 8.6 16 1Z"/></svg>';

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const today = new Date().toISOString().slice(0, 10);
  const liveCoupons = (store) => store.coupons.filter((c) => !c.expires || c.expires >= today);
  // The headline offer for a store: the first live coupon that has a code, else the first live deal.
  const bestCoupon = (store) => {
    const live = liveCoupons(store);
    return live.find((c) => c.code) || live[0];
  };
  const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
  // Categories without any store are left out of the chips and footer. Set once the stores load.
  let activeCategories = [];
  const storeUrl = (s) => `store.html?s=${encodeURIComponent(s.slug)}`;
  const categoryUrl = (c) => `category.html?c=${encodeURIComponent(c.slug)}`;
  const OUT = 'target="_blank" rel="sponsored nofollow noopener"';

  // Ask Shopify's image CDN for a smaller file than the original upload.
  function sized(url, width) {
    if (!/cdn\.shopify\.com|\/cdn\/shop\//.test(url)) return url;
    try {
      const u = new URL(url);
      u.searchParams.set("width", width);
      return u.toString();
    } catch {
      return url;
    }
  }

  // The store's cover photo; --zoom crops off any border built into the image.
  function coverImg(store, width, attrs) {
    const zoom = store.coverZoom ? ` style="--zoom:${Number(store.coverZoom)}"` : "";
    return `<img src="${esc(sized(store.cover, width))}"${zoom} ${attrs}>`;
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function initials(name) {
    return name
      .replace(/[^A-Za-z0-9 ]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function logoHTML(store, large) {
    const cls = large ? "logo lg" : "logo";
    if (store.logo) {
      return `<span class="${cls}"><img src="${esc(sized(store.logo, 160))}" alt="" loading="lazy" width="72" height="72"></span>`;
    }
    return `<span class="${cls}" style="background:${esc(store.color || "#261A2E")}" aria-hidden="true">${esc(initials(store.name))}</span>`;
  }

  // "15%" and "$20" get a big number plus "off"; anything else ("Free ship") is set smaller.
  function stubHTML(discount) {
    const isAmount = /^[$€£]?\d+%?$/.test(discount);
    if (isAmount) {
      return `<div class="stub"><span class="amt">${esc(discount)}</span><span class="unit">off</span></div>`;
    }
    return `<div class="stub"><span class="amt long">${esc(discount)}</span></div>`;
  }

  function labelsHTML(c) {
    return `<div class="labels">
      <span class="label">${c.code ? "Code" : "Deal"}</span>
      ${c.verified ? `<span class="label ok">${ICON_CHECK}Verified</span>` : ""}
    </div>`;
  }

  function metaHTML(c) {
    return [
      c.expires ? `<span>Expires ${formatDate(c.expires)}</span>` : `<span>No expiry date</span>`,
      c.code ? "" : `<span>No code needed</span>`,
    ].join("");
  }

  // The button that reveals a code (or opens a no-code deal). Indexes point into liveCoupons(store).
  // The last few characters of the code peek out from under the button, like a half-peeled sticker.
  function actionHTML(store, c) {
    const index = liveCoupons(store).indexOf(c);
    if (!c.code) return `<a class="btn" href="${esc(store.url)}" ${OUT}>Get deal</a>`;
    return `<button class="reveal" type="button" data-reveal="${esc(store.slug)}" data-index="${index}">
      <span class="reveal-peek" aria-hidden="true">${esc(c.code.slice(-3))}</span>
      <span class="reveal-label">Show code</span>
    </button>`;
  }

  /* ---------- Shared chrome ---------- */

  function renderHeader() {
    const navItems = [
      ["index.html", "All stores", "home"],
      ["about.html", "About", "about"],
      ["contact.html", "Contact", "contact"],
      ["disclaimer.html", "Affiliate disclosure", "disclaimer"],
    ];
    const nav = navItems
      .map(([href, label, key]) => `<li class="nav-${key}"><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`)
      .join("");
    const headerSearch =
      page === "home"
        ? ""
        : `<form class="header-search" action="index.html" role="search">
             <label class="search">${ICON_SEARCH}
               <span class="skip">Search stores</span>
               <input type="search" name="q" placeholder="Search stores and products" autocomplete="off">
             </label>
           </form>`;

    document.getElementById("header").outerHTML = `
      <a class="skip" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="index.html">${BRAND_MARK}<span>${esc(SITE.name)}</span></a>
          <nav class="main-nav" aria-label="Main"><ul>${nav}</ul></nav>
          ${headerSearch}
        </div>
      </header>`;
  }

  function renderFooter() {
    const cats = activeCategories.map((c) => `<li><a href="${categoryUrl(c)}">${esc(c.name)}</a></li>`).join("");
    document.getElementById("footer").outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div>
            <a class="brand" href="index.html">${BRAND_MARK}<span>${esc(SITE.name)}</span></a>
            <p>${esc(SITE.name)} earns a commission when you buy through links on this site, at no extra cost to you.
               <a href="disclaimer.html">How this works</a>.</p>
          </div>
          <ul aria-label="More">${cats}<li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul>
        </div>
      </footer>
      <div class="toast" role="status" aria-live="polite"></div>`;
  }

  let toastTimer;
  function toast(msg) {
    const el = document.querySelector(".toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  const storesIn = (cat) => STORES.filter((s) => s.category === cat.slug);
  const storeCount = (n) => `${n} store${n === 1 ? "" : "s"}`;

  // The biggest percentage off among a set of stores' live codes, e.g. "25%".
  function topPercent(stores) {
    let best = 0;
    stores.forEach((s) =>
      liveCoupons(s).forEach((c) => {
        const m = /^(\d+(?:\.\d+)?)%$/.exec(c.discount);
        if (m) best = Math.max(best, parseFloat(m[1]));
      })
    );
    return best ? `${best}%` : "";
  }

  function chipsHTML(activeSlug) {
    if (activeCategories.length < 2) return "";
    const chip = (href, label, n, current) =>
      `<li><a href="${href}"${current ? ' aria-current="page"' : ""}>${esc(label)}<span class="count"><span class="skip">, </span>${n}<span class="skip"> stores</span></span></a></li>`;
    const items = [chip("index.html", "All", STORES.length, !activeSlug)]
      .concat(activeCategories.map((c) => chip(categoryUrl(c), c.name, storesIn(c).length, c.slug === activeSlug)))
      .join("");
    return `<nav aria-label="Categories"><ul class="chips">${items}</ul></nav>`;
  }

  // Home page category tile: a store photo, the category, how many stores and the best percentage.
  function categoryCardHTML(cat) {
    const stores = storesIn(cat);
    const pic = stores.find((s) => s.cover);
    const top = topPercent(stores);
    return `<li>
      <a class="cat-card" href="${categoryUrl(cat)}">
        <span class="cat-img">${pic ? coverImg(pic, 500, 'alt="" loading="lazy" width="280" height="175"') : ""}</span>
        <span class="cat-body">
          <span class="cat-name">${esc(cat.name)}</span>
          <span class="cat-meta">${storeCount(stores.length)}${top ? `, up to ${top} off` : ""}</span>
          <span class="cat-logos" aria-hidden="true">${stores.slice(0, 5).map((s) => logoHTML(s)).join("")}</span>
        </span>
      </a>
    </li>`;
  }

  /* ---------- Cards ---------- */

  function ticketHTML(store) {
    const best = bestCoupon(store);
    if (!best || !store.cover) return "";
    const amount = /^[$€£]?\d+%?$/.test(best.discount) ? `${best.discount} off` : best.discount;
    return `<a class="ticket" href="${storeUrl(store)}">
      <span class="ticket-img">${coverImg(store, 600, `alt="${esc(store.name)}" width="270" height="230"`)}</span>
      <span class="tear"><span class="store">${esc(store.name)}</span><span class="amt">${esc(amount)}</span></span>
    </a>`;
  }

  function dealCardHTML(store) {
    const best = bestCoupon(store);
    if (!best) return "";
    const photo = store.cover
      ? `<a class="deal-photo" href="${storeUrl(store)}" tabindex="-1" aria-hidden="true">${coverImg(store, 500, 'alt="" loading="lazy" width="168" height="180"')}</a>`
      : `<span class="deal-photo blank" style="background:${esc(store.color || "#261A2E")}" aria-hidden="true">${esc(initials(store.name))}</span>`;
    return `<li class="deal">
      ${photo}
      <div class="deal-body">
        <a class="who" href="${storeUrl(store)}">${logoHTML(store)}<span>${esc(store.name)}</span></a>
        ${labelsHTML(best)}
        <h3>${esc(best.title)}</h3>
        <div class="meta">${metaHTML(best)}</div>
        <div class="action">${actionHTML(store, best)}</div>
      </div>
      ${stubHTML(best.discount)}
    </li>`;
  }

  function productCardHTML(product, store) {
    const best = bestCoupon(store);
    const tag = best && best.code && /%|\$/.test(best.discount) ? `<span class="tag">${esc(best.discount)} off with ${esc(best.code)}</span>` : "";
    return `<li>
      <a class="product" href="${esc(product.url)}" data-store="${esc(store.slug)}" ${OUT}>
        ${
          product.image
            ? `<span class="img"><img src="${esc(sized(product.image, 500))}" alt="" loading="lazy" width="250" height="250"></span>`
            : `<span class="img blank" style="background:${esc(store.color || "#261A2E")}" aria-hidden="true">${esc(initials(store.name))}</span>`
        }
        <span class="info">
          <span class="name">${esc(product.name)}</span>
          <span class="from">${esc(store.name)}</span>
          ${tag}
        </span>
      </a>
    </li>`;
  }

  // Interleave products from every store so one brand doesn't fill the whole grid.
  function allProducts(stores) {
    const lists = stores.map((s) => (s.products || []).map((p) => [p, s]));
    const out = [];
    for (let i = 0; lists.some((l) => l[i]); i++) lists.forEach((l) => l[i] && out.push(l[i]));
    return out;
  }

  const STEPS_HTML = `
    <section class="section" aria-labelledby="how-title">
      <div class="wrap">
        <div class="section-head"><h2 id="how-title">How it works</h2></div>
        <ol class="steps">
          <li><h3>Pick a code</h3><p>Select <strong>Show code</strong> on any offer. The code is copied for you.</p></li>
          <li><h3>Shop the store</h3><p>The store opens in a new tab. Add what you like to your cart.</p></li>
          <li><h3>Paste at checkout</h3><p>Paste the code in the discount box and the price drops before you pay.</p></li>
        </ol>
      </div>
    </section>`;

  /* ---------- Pages ---------- */

  function renderHome() {
    const main = document.getElementById("main");
    const q = params.get("q") || "";
    const first = STORES[0];
    main.innerHTML = `
      <section class="hero">
        <div class="wrap">
          <div>
            <h1>Self-care, for less.</h1>
            <p>${esc(SITE.tagline)}</p>
            <form role="search" onsubmit="return false">
              <label class="search">${ICON_SEARCH}
                <span class="skip">Search stores and products</span>
                <input id="q" type="search" placeholder="Search${first ? `, like “${esc(first.name)}”` : ""}" autocomplete="off" value="${esc(q)}">
              </label>
            </form>
          </div>
          <div class="ticket-fan">${STORES.slice(0, 2).map(ticketHTML).join("")}</div>
        </div>
      </section>
      ${
        activeCategories.length > 1
          ? `<section class="section" aria-labelledby="cats-title" id="cats-section">
               <div class="wrap">
                 <div class="section-head"><h2 id="cats-title">Shop by category</h2></div>
                 <ul class="cats">${activeCategories.map(categoryCardHTML).join("")}</ul>
               </div>
             </section>`
          : ""
      }
      <section class="section" aria-labelledby="deals-title">
        <div class="wrap">
          <div class="section-head"><h2 id="deals-title">Today’s codes</h2></div>
          <p class="result-note" id="note" aria-live="polite"></p>
          <ul class="deals" id="deals"></ul>
        </div>
      </section>
      <section class="section" aria-labelledby="shop-title" id="shop-section">
        <div class="wrap">
          <div class="section-head">
            <h2 id="shop-title">Shop the favourites</h2>
            <p>Your code still works on these. Each opens on the store’s own site.</p>
          </div>
          <ul class="products" id="products"></ul>
        </div>
      </section>
      ${STEPS_HTML}`;

    const input = document.getElementById("q");
    const deals = document.getElementById("deals");
    const products = document.getElementById("products");
    const shopSection = document.getElementById("shop-section");
    const catsSection = document.getElementById("cats-section");
    const note = document.getElementById("note");

    function update() {
      const term = input.value.trim().toLowerCase();
      const matchesStore = (s) => {
        const cat = categoryBySlug(s.category);
        return [s.name, cat && cat.name, s.about, ...s.coupons.map((c) => c.title)].join(" ").toLowerCase().includes(term);
      };
      const storeHits = term ? STORES.filter(matchesStore) : STORES;
      const productHits = allProducts(STORES).filter(
        ([p, s]) => !term || storeHits.includes(s) || p.name.toLowerCase().includes(term)
      );
      // A product match also surfaces its store's code.
      const dealStores = term ? STORES.filter((s) => storeHits.includes(s) || productHits.some(([, ps]) => ps === s)) : STORES;

      deals.innerHTML = dealStores.map(dealCardHTML).join("");
      products.innerHTML = productHits.map(([p, s]) => productCardHTML(p, s)).join("");
      shopSection.hidden = productHits.length === 0;
      // While searching, results come straight under the search box.
      if (catsSection) catsSection.hidden = Boolean(term);
      note.textContent = !term
        ? ""
        : dealStores.length
          ? `${dealStores.length} store${dealStores.length === 1 ? "" : "s"} match “${input.value.trim()}”.`
          : `Nothing matches “${input.value.trim()}”. Check the spelling or clear the search to see every code.`;

      const url = new URL(location);
      term ? url.searchParams.set("q", input.value.trim()) : url.searchParams.delete("q");
      history.replaceState(null, "", url);
    }

    input.addEventListener("input", update);
    update();
  }

  function renderCategory() {
    const main = document.getElementById("main");
    const cat = categoryBySlug(params.get("c"));
    if (!cat) return renderNotFound("We couldn't find that category.");

    document.title = `${cat.name} coupon codes | ${SITE.name}`;
    const stores = storesIn(cat);
    const products = allProducts(stores);
    const top = topPercent(stores);
    main.innerHTML = `
      <section class="page-head">
        <div class="wrap">
          <h1>${esc(cat.name)}</h1>
          <p>${esc(cat.intro)}</p>
          ${stores.length ? `<p class="cat-stat">${storeCount(stores.length)} with codes${top ? `, up to ${top} off` : ""}.</p>` : ""}
          ${chipsHTML(cat.slug)}
        </div>
      </section>
      <section class="section" aria-label="Codes">
        <div class="wrap">
          ${
            stores.length
              ? `<ul class="deals">${stores.map(dealCardHTML).join("")}</ul>`
              : `<div class="empty"><h2>No stores here yet</h2><p>New codes are added every week. Browse <a href="index.html">all stores</a> in the meantime.</p></div>`
          }
        </div>
      </section>
      ${
        products.length
          ? `<section class="section" aria-labelledby="shop-title"><div class="wrap">
               <div class="section-head"><h2 id="shop-title">Shop the favourites</h2></div>
               <ul class="products">${products.map(([p, s]) => productCardHTML(p, s)).join("")}</ul>
             </div></section>`
          : ""
      }`;
  }

  function renderStore() {
    const main = document.getElementById("main");
    const store = STORES.find((s) => s.slug === params.get("s"));
    if (!store) return renderNotFound("We couldn't find that store.");

    const cat = categoryBySlug(store.category);
    const coupons = liveCoupons(store);
    const best = bestCoupon(store);
    document.title = `${store.name} coupon codes${best ? `: ${best.title}` : ""} | ${SITE.name}`;

    const couponItems = coupons
      .map(
        (c) => `<li class="coupon">
          ${stubHTML(c.discount)}
          <div class="main">
            <div class="text">
              ${labelsHTML(c)}
              <h3>${esc(c.title)}</h3>
              <div class="meta">${metaHTML(c)}</div>
              ${c.details ? `<details class="terms"><summary>See details</summary><p>${esc(c.details)}</p></details>` : ""}
            </div>
            <div class="action">${actionHTML(store, c)}</div>
          </div>
        </li>`
      )
      .join("");

    const products = (store.products || []).map((p) => productCardHTML(p, store)).join("");
    const listDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const highlights = [
      ["Best discount", best ? (/^[$€£]?\d+%?$/.test(best.discount) ? `${best.discount} off` : best.discount) : "None"],
      ["Coupon codes", coupons.filter((c) => c.code).length],
      ["Deals", coupons.filter((c) => !c.code).length],
      ["Verified", coupons.filter((c) => c.verified).length],
    ]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
      .join("");

    main.innerHTML = `
      <section class="store-hero">
        <div class="wrap">
          <div>
            <div class="crumbs"><a href="index.html">All stores</a>${cat ? ` / <a href="${categoryUrl(cat)}">${esc(cat.name)}</a>` : ""}</div>
            <h1>${esc(store.name)} coupon codes</h1>
            <p>${esc(store.about)}</p>
            <a class="btn secondary" href="${esc(store.url)}" ${OUT}>Visit ${esc(store.name)}</a>
          </div>
          ${store.cover ? `<div class="cover">${coverImg(store, 900, `alt="${esc(store.name)}" width="480" height="360"`)}</div>` : logoHTML(store, true)}
        </div>
      </section>
      <div class="wrap">
        <div class="store-layout">
          <section aria-labelledby="offers-title">
            <h2 class="list-title" id="offers-title">Top ${esc(store.name)} codes for ${listDate}</h2>
            ${
              coupons.length
                ? `<ul class="coupons">${couponItems}</ul>`
                : `<div class="empty"><h2>No active codes right now</h2><p>The last code for ${esc(store.name)} has expired. You can still shop the store directly.</p><a class="btn" href="${esc(store.url)}" ${OUT}>Visit ${esc(store.name)}</a></div>`
            }
          </section>
          <aside>
            <div class="panel highlights">
              <h2>Code highlights</h2>
              <dl>${highlights}</dl>
            </div>
            <div class="panel">
              <h2>How to use a code</h2>
              <ol>
                <li>Select <strong>Show code</strong>. Your code opens in a new tab and is copied for you.</li>
                <li>This tab takes you to ${esc(store.name)}. Add what you like to your cart.</li>
                <li>Paste the code in the discount box at checkout.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
      ${
        products
          ? `<section class="section" aria-labelledby="popular-title"><div class="wrap">
               <div class="section-head"><h2 id="popular-title">Popular at ${esc(store.name)}</h2></div>
               <ul class="products">${products}</ul>
             </div></section>`
          : ""
      }`;

    // Opened from a "Show code" click: this tab is the one that shows the code.
    const fromReveal = coupons[Number(params.get("c"))];
    if (params.has("c") && fromReveal && fromReveal.code) openModal(store, fromReveal);
  }

  function renderNotFound(message) {
    document.getElementById("main").innerHTML = `
      <div class="wrap page-head">
        <div class="empty">
          <h1>Page not found</h1>
          <p>${esc(message)} It may have been removed or the link is mistyped.</p>
          <a class="btn secondary" href="index.html">Browse all stores</a>
        </div>
      </div>`;
  }

  /* ---------- Code reveal and copy ---------- */

  function copy(text) {
    const done = () => toast(`Code ${text} copied. Paste it at checkout.`);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => toast("Select the code and copy it manually."));
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch {
        toast("Select the code and copy it manually.");
      }
      ta.remove();
    }
  }

  // The code dialog: store logo, offer, the code with a Copy button, and a way on to the store.
  let lastFocus = null;

  function openModal(store, coupon, product) {
    closeModal(true);
    lastFocus = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" aria-label="Close">${ICON_CLOSE}</button>
        ${logoHTML(store, true)}
        <h2 id="modal-title">${esc(coupon.title)}</h2>
        <p class="modal-sub">${
          product
            ? `${esc(product)} is open in a new tab. Paste this code at checkout on ${esc(store.name)}.`
            : `Copy this code and paste it at checkout on ${esc(store.name)}.`
        }</p>
        <div class="code-box big">
          <span class="code">${esc(coupon.code)}</span>
          <button type="button" data-copy="${esc(coupon.code)}">Copy</button>
        </div>
        <a class="btn secondary wide" href="${esc(store.url)}" ${OUT}>Shop at ${esc(store.name)}</a>
        ${coupon.details ? `<div class="modal-details"><h3>Offer details</h3><p>${esc(coupon.details)}</p></div>` : ""}
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("modal-open");
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest(".modal-close")) closeModal();
    });
    wrap.querySelector("[data-copy]").focus();
  }

  function closeModal(silent) {
    const m = document.querySelector(".modal");
    if (!m) return;
    m.remove();
    document.body.classList.remove("modal-open");
    const url = new URL(location);
    if (url.searchParams.has("c")) {
      url.searchParams.delete("c");
      history.replaceState(null, "", url);
    }
    if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  document.addEventListener("keydown", (e) => {
    const m = document.querySelector(".modal");
    if (!m) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      // Keep keyboard focus inside the dialog.
      const items = [...m.querySelectorAll("button, a[href]")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // "Show code": a new tab opens on this site with the code dialog, and this tab goes to the store
  // through the affiliate link. If the browser blocks the new tab, the dialog opens here instead.
  function revealCode(store, coupon, index) {
    copy(coupon.code);
    const codeTab = window.open(`${storeUrl(store)}&c=${index}`, "_blank");
    if (codeTab) {
      try {
        codeTab.opener = null;
      } catch {}
      setTimeout(() => location.assign(store.url), 60);
    } else {
      openModal(store, coupon);
    }
  }

  document.addEventListener("click", (e) => {
    const reveal = e.target.closest("[data-reveal]");
    if (reveal) {
      const store = STORES.find((s) => s.slug === reveal.dataset.reveal);
      const index = Number(reveal.dataset.index);
      const coupon = store && liveCoupons(store)[index];
      if (coupon) revealCode(store, coupon, index);
      return;
    }

    // A product opens in a new tab (the link's own behaviour); this tab keeps the store's code ready.
    const productLink = e.target.closest("a.product[data-store]");
    if (productLink) {
      const store = STORES.find((s) => s.slug === productLink.dataset.store);
      const coupon = store && bestCoupon(store);
      if (coupon && coupon.code) {
        copy(coupon.code);
        openModal(store, coupon, productLink.querySelector(".name")?.textContent);
      }
      return;
    }

    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      copy(copyBtn.dataset.copy);
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("done");
    }
  });

  /* ---------- Boot ---------- */

  async function boot() {
    renderHeader();
    // Pages that list codes wait for the sheet; the rest use the last saved copy for the footer.
    const listsCodes = ["home", "category", "store"].includes(page);
    const main = document.getElementById("main");
    const slow = listsCodes && setTimeout(() => (main.innerHTML = '<p class="wrap loading">Loading today’s codes…</p>'), 500);
    const fresh = window.loadSheetStores ? await window.loadSheetStores({ fetchSheet: listsCodes }) : null;
    clearTimeout(slow);
    if (fresh && fresh.length) STORES.splice(0, STORES.length, ...fresh);
    activeCategories = CATEGORIES.filter((c) => STORES.some((s) => s.category === c.slug));

    renderFooter();
    document.querySelectorAll("[data-site-name]").forEach((el) => (el.textContent = SITE.name));
    document.querySelectorAll("[data-site-email]").forEach((el) => {
      el.textContent = SITE.email;
      el.href = `mailto:${SITE.email}`;
    });

    if (page === "home") renderHome();
    else if (page === "category") renderCategory();
    else if (page === "store") renderStore();
  }

  boot();
})();
