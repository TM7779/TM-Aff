/*
 * All site content lives here. Edit this file to add stores, coupons and categories.
 *
 * The stores below are SAMPLE DATA with made-up names and codes.
 * Replace them with real merchants, your own affiliate links and real codes before going live.
 *
 * Store fields:
 *   slug      - used in the URL: store.html?s=<slug> (lowercase, no spaces)
 *   name      - store name
 *   category  - slug of one category below
 *   url       - YOUR affiliate link (every "Show code" / "Get deal" click opens it)
 *   logo      - optional image path or URL; leave "" to show a coloured monogram
 *   color     - monogram background when there is no logo
 *   about     - one or two sentences about the store
 *   coupons   - list of offers:
 *       title    - what the shopper gets
 *       discount - short text for the stub, e.g. "15%", "$20", "Free ship"
 *       code     - the coupon code; leave "" for a deal that needs no code
 *       expires  - "YYYY-MM-DD" or "" if it doesn't expire
 *       verified - true if you've checked the code works
 */

const SITE = {
  name: "Clipjar",
  tagline: "Coupon codes that still work, checked by hand.",
  // On Hostinger this comes from the CONTACT_EMAIL environment variable.
  email: (window.SITE_ENV && window.SITE_ENV.email) || "hello@example.com",
};

const CATEGORIES = [
  {
    slug: "clothing-accessories",
    name: "Clothing & accessories",
    intro:
      "Bags, jewellery, everyday basics and statement pieces. Every code here was tested on the store's own checkout.",
  },
  {
    slug: "home-garden",
    name: "Home & garden",
    intro: "Bedding, kitchenware, plants and tools for every room and yard.",
  },
  {
    slug: "health-beauty",
    name: "Health & beauty",
    intro: "Skincare, supplements, fragrance and grooming from independent brands.",
  },
  {
    slug: "electronics",
    name: "Electronics",
    intro: "Audio, chargers, smart-home gear and accessories for your devices.",
  },
];

const STORES = [
  {
    slug: "linden-bag-co",
    name: "Linden Bag Co.",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#B8476A",
    about: "Handmade canvas and leather totes, crossbody bags and pouches.",
    coupons: [
      { title: "15% off your first order", discount: "15%", code: "LINDEN15", expires: "2026-12-31", verified: true },
      { title: "Free shipping on orders over $50", discount: "Free ship", code: "", expires: "", verified: true },
    ],
  },
  {
    slug: "oakline-essentials",
    name: "Oakline Essentials",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#2F5D46",
    about: "Organic cotton basics: tees, loungewear and socks.",
    coupons: [
      { title: "15% off your first order", discount: "15%", code: "OAK15", expires: "2026-11-30", verified: true },
    ],
  },
  {
    slug: "voltwear",
    name: "Voltwear",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#151515",
    about: "Festival and rave outfits, LED accessories and bodysuits.",
    coupons: [
      { title: "15% off your first order", discount: "15%", code: "VOLT15", expires: "", verified: true },
      { title: "$10 off orders over $80", discount: "$10", code: "VOLT10", expires: "2026-12-15", verified: false },
    ],
  },
  {
    slug: "marlow-house",
    name: "Marlow House",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#6B4E9B",
    about: "Vintage-inspired dresses and knitwear.",
    coupons: [
      { title: "15% off your first order", discount: "15%", code: "MARLOW15", expires: "", verified: true },
    ],
  },
  {
    slug: "ridge-and-rope",
    name: "Ridge & Rope",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#8A5A2B",
    about: "Western boots, belts and hats made in small batches.",
    coupons: [
      { title: "20% off sitewide during the winter sale", discount: "20%", code: "", expires: "2027-01-10", verified: true },
    ],
  },
  {
    slug: "nove-studio",
    name: "Nove Studio",
    category: "clothing-accessories",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#1D1B4C",
    about: "Minimal gold-plated jewellery and watches.",
    coupons: [
      { title: "15% off your first order", discount: "15%", code: "NOVE15", expires: "", verified: true },
    ],
  },
  {
    slug: "fernhollow",
    name: "Fernhollow",
    category: "home-garden",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#3E7A3A",
    about: "Indoor plants, planters and plant care kits delivered to your door.",
    coupons: [
      { title: "$15 off your first plant order", discount: "$15", code: "GROW15", expires: "2026-12-31", verified: true },
    ],
  },
  {
    slug: "loomly-linen",
    name: "Loomly Linen",
    category: "home-garden",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#9C7B5B",
    about: "Stone-washed linen sheets, duvet covers and throws.",
    coupons: [
      { title: "10% off bedding sets", discount: "10%", code: "SLEEP10", expires: "", verified: true },
    ],
  },
  {
    slug: "dewbloom",
    name: "Dewbloom",
    category: "health-beauty",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#C2557A",
    about: "Gentle Korean-inspired skincare for sensitive skin.",
    coupons: [
      { title: "20% off your first order", discount: "20%", code: "DEW20", expires: "", verified: true },
      { title: "Free sample set with orders over $40", discount: "Gift", code: "", expires: "", verified: true },
    ],
  },
  {
    slug: "pulse-audio",
    name: "Pulse Audio",
    category: "electronics",
    url: "https://example.com/?ref=YOUR-AFFILIATE-ID",
    logo: "",
    color: "#1F4FA3",
    about: "Wireless earbuds, speakers and studio headphones.",
    coupons: [
      { title: "$25 off headphones over $150", discount: "$25", code: "PULSE25", expires: "2026-11-29", verified: true },
    ],
  },
];
