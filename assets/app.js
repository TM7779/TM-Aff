/* Renders every page from the data in data.js. Each HTML file sets <body data-page="...">. */

(function () {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  const ICON_SEARCH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const BRAND_MARK =
    '<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true"><path fill="#F26B1D" d="M4 6h26a2 2 0 0 1 2 2v5a4 4 0 0 0 0 8v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a4 4 0 0 0 0-8V8a2 2 0 0 1 2-2Z"/><path stroke="#10233A" stroke-width="2" stroke-dasharray="2.5 2.5" d="M22 9v16"/><circle cx="11" cy="13" r="2.2" fill="#10233A"/><circle cx="15" cy="21" r="2.2" fill="#10233A"/><path stroke="#10233A" stroke-width="2" stroke-linecap="round" d="M16.5 11.5 9.5 22.5"/></svg>';

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const today = new Date().toISOString().slice(0, 10);
  const liveCoupons = (store) => store.coupons.filter((c) => !c.expires || c.expires >= today);
  const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
  const storeUrl = (s) => `store.html?s=${encodeURIComponent(s.slug)}`;
  const categoryUrl = (c) => `category.html?c=${encodeURIComponent(c.slug)}`;

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
      return `<span class="${cls}"><img src="${esc(store.logo)}" alt="" loading="lazy" width="96" height="96"></span>`;
    }
    return `<span class="${cls}" style="background:${esc(store.color || "#10233A")}" aria-hidden="true">${esc(initials(store.name))}</span>`;
  }

  // "15%" and "$20" get a big number plus "off"; anything else ("Free ship") is set smaller.
  function stubHTML(discount) {
    const isAmount = /^[$€£]?\d+%?$/.test(discount);
    if (isAmount) {
      return `<div class="stub"><span class="amt">${esc(discount)}</span><span class="unit">off</span></div>`;
    }
    return `<div class="stub"><span class="amt long">${esc(discount)}</span></div>`;
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
      .map(([href, label, key]) => `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`)
      .join("");
    const headerSearch =
      page === "home"
        ? ""
        : `<form class="header-search" action="index.html" role="search">
             <label class="search">${ICON_SEARCH}
               <span class="skip">Search stores</span>
               <input type="search" name="q" placeholder="Search stores" autocomplete="off">
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
    const cats = CATEGORIES.map((c) => `<li><a href="${categoryUrl(c)}">${esc(c.name)}</a></li>`).join("");
    document.getElementById("footer").outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <p>${esc(SITE.name)} earns a commission when you buy through links on this site, at no extra cost to you.
             <a href="disclaimer.html">How this works</a>.</p>
          <ul aria-label="Categories">${cats}</ul>
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
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function chipsHTML(activeSlug) {
    const items = [`<li><a href="index.html"${activeSlug ? "" : ' aria-current="page"'}>All</a></li>`]
      .concat(
        CATEGORIES.map(
          (c) => `<li><a href="${categoryUrl(c)}"${c.slug === activeSlug ? ' aria-current="page"' : ""}>${esc(c.name)}</a></li>`
        )
      )
      .join("");
    return `<nav aria-label="Categories"><ul class="chips">${items}</ul></nav>`;
  }

  function storeCardHTML(store) {
    const best = liveCoupons(store)[0];
    if (!best) return "";
    return `<li>
      <a class="store-card" href="${storeUrl(store)}">
        <div class="body">
          <div class="who">${logoHTML(store)}<span class="name">${esc(store.name)}</span></div>
          <p class="offer">${esc(best.title)}</p>
        </div>
        ${stubHTML(best.discount)}
      </a>
    </li>`;
  }

  /* ---------- Pages ---------- */

  function renderHome() {
    const main = document.getElementById("main");
    const q = params.get("q") || "";
    main.innerHTML = `
      <section class="hero">
        <div class="wrap">
          <h1>Find a working code before you check out.</h1>
          <p>${esc(SITE.tagline)} Pick a store, show the code, paste it at checkout.</p>
          <form role="search" onsubmit="return false">
            <label class="search">${ICON_SEARCH}
              <span class="skip">Search for a store</span>
              <input id="q" type="search" placeholder="Search for a store, like “Linden”" autocomplete="off" value="${esc(q)}">
            </label>
          </form>
          ${chipsHTML(null)}
        </div>
      </section>
      <section class="section" aria-labelledby="list-title">
        <div class="wrap">
          <h2 id="list-title">All stores</h2>
          <p class="result-note" id="note" aria-live="polite"></p>
          <ul class="grid" id="grid"></ul>
        </div>
      </section>`;

    const input = document.getElementById("q");
    const grid = document.getElementById("grid");
    const note = document.getElementById("note");
    const title = document.getElementById("list-title");

    function update() {
      const term = input.value.trim().toLowerCase();
      const matches = STORES.filter((s) => {
        if (!term) return true;
        const cat = categoryBySlug(s.category);
        const hay = [s.name, cat && cat.name, ...s.coupons.map((c) => c.title)].join(" ").toLowerCase();
        return hay.includes(term);
      });
      title.textContent = term ? "Search results" : "All stores";
      note.textContent = term
        ? matches.length
          ? `${matches.length} store${matches.length === 1 ? "" : "s"} match “${input.value.trim()}”.`
          : `No stores match “${input.value.trim()}”. Check the spelling or browse a category above.`
        : "";
      grid.innerHTML = matches.map(storeCardHTML).join("");
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
    const stores = STORES.filter((s) => s.category === cat.slug);
    main.innerHTML = `
      <section class="page-head">
        <div class="wrap">
          <h1>${esc(cat.name)}</h1>
          <p>${esc(cat.intro)}</p>
          ${chipsHTML(cat.slug)}
        </div>
      </section>
      <section class="section" aria-label="Stores">
        <div class="wrap">
          ${
            stores.length
              ? `<ul class="grid">${stores.map(storeCardHTML).join("")}</ul>`
              : `<div class="empty"><h2>No stores here yet</h2><p>New codes are added every week. Browse <a href="index.html">all stores</a> in the meantime.</p></div>`
          }
        </div>
      </section>`;
  }

  function renderStore() {
    const main = document.getElementById("main");
    const store = STORES.find((s) => s.slug === params.get("s"));
    if (!store) return renderNotFound("We couldn't find that store.");

    const cat = categoryBySlug(store.category);
    const coupons = liveCoupons(store);
    document.title = `${store.name} coupon codes | ${SITE.name}`;

    const couponItems = coupons
      .map((c, i) => {
        const meta = [
          c.verified ? `<span class="ok">${ICON_CHECK}Verified</span>` : "",
          c.expires ? `<span>Expires ${formatDate(c.expires)}</span>` : `<span>No expiry date</span>`,
          c.code ? "" : `<span>No code needed</span>`,
        ].join("");
        const action = c.code
          ? `<button class="btn" type="button" data-reveal="${i}">Show code</button>`
          : `<a class="btn" href="${esc(store.url)}" target="_blank" rel="sponsored nofollow noopener">Get deal</a>`;
        return `<li class="coupon">
          ${stubHTML(c.discount)}
          <div class="main">
            <div>
              <h2>${esc(c.title)}</h2>
              <div class="meta">${meta}</div>
            </div>
            <div class="action">${action}</div>
          </div>
        </li>`;
      })
      .join("");

    main.innerHTML = `
      <div class="wrap">
        <div class="store-head">
          ${logoHTML(store, true)}
          <div>
            <div class="crumbs"><a href="index.html">All stores</a> / ${cat ? `<a href="${categoryUrl(cat)}">${esc(cat.name)}</a>` : ""}</div>
            <h1>${esc(store.name)} coupon codes</h1>
            <p>${esc(store.about)}</p>
          </div>
        </div>
        <div class="store-layout">
          <section aria-label="Offers">
            ${
              coupons.length
                ? `<ul class="coupons">${couponItems}</ul>`
                : `<div class="empty"><h2>No active codes right now</h2><p>The last code for ${esc(store.name)} has expired. You can still shop the store directly.</p><a class="btn" href="${esc(store.url)}" target="_blank" rel="sponsored nofollow noopener">Visit ${esc(store.name)}</a></div>`
            }
          </section>
          <aside>
            <div class="panel">
              <h2>How to use a code</h2>
              <ol>
                <li>Select <strong>Show code</strong>. The store opens in a new tab.</li>
                <li>Copy the code from this page.</li>
                <li>Paste it in the promo code box at checkout.</li>
              </ol>
            </div>
            <div class="panel">
              <h2>About ${esc(store.name)}</h2>
              <p>${esc(store.about)}</p>
              <a class="btn secondary" href="${esc(store.url)}" target="_blank" rel="sponsored nofollow noopener">Visit store</a>
            </div>
          </aside>
        </div>
      </div>`;

    main.addEventListener("click", (e) => {
      const reveal = e.target.closest("[data-reveal]");
      if (reveal) {
        const coupon = coupons[Number(reveal.dataset.reveal)];
        reveal.parentElement.innerHTML = `
          <div class="code-box">
            <span class="code">${esc(coupon.code)}</span>
            <button type="button" data-copy="${esc(coupon.code)}">Copy</button>
          </div>`;
        copy(coupon.code);
        // Open the affiliate link last so a blocked popup can't stop the code from showing.
        try {
          window.open(store.url, "_blank", "noopener");
        } catch {}
        return;
      }
      const copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        copy(copyBtn.dataset.copy);
        copyBtn.textContent = "Copied";
      }
    });
  }

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

  /* ---------- Boot ---------- */

  renderHeader();
  renderFooter();
  document.querySelectorAll("[data-site-name]").forEach((el) => (el.textContent = SITE.name));
  document.querySelectorAll("[data-site-email]").forEach((el) => {
    el.textContent = SITE.email;
    el.href = `mailto:${SITE.email}`;
  });

  if (page === "home") renderHome();
  else if (page === "category") renderCategory();
  else if (page === "store") renderStore();
})();
