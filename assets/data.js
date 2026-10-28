/*
 * All site content lives here. Edit this file to add stores, coupons and categories.
 *
 * Categories with no stores are hidden automatically.
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
  tagline: "Coupon codes for independent online stores.",
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
    intro: "Skin patches, eye masks, herbal teas and other wellness products from independent brands.",
  },
  {
    slug: "electronics",
    name: "Electronics",
    intro: "Audio, chargers, smart-home gear and accessories for your devices.",
  },
];

const STORES = [
  {
    slug: "tolevita",
    name: "Tolevita",
    category: "health-beauty",
    url: "https://shop.tolevita.com?sca_ref=11252630.LxmEzKMaaNq",
    logo: "https://shop.tolevita.com/cdn/shop/files/Tolevita_Logo_Creatine.png?v=1741773248&width=192",
    color: "#1F6F8B",
    about: "Vitamin and herbal patches, hydrogel eye masks and scar tape. Free shipping on US orders over $20.",
    coupons: [
      { title: "Extra savings with code SALA38 at checkout", discount: "Code", code: "SALA38", expires: "", verified: false },
      { title: "Free shipping on US orders over $20", discount: "Free ship", code: "", expires: "", verified: true },
    ],
  },
  {
    slug: "genuine-essiac",
    name: "Genuine Essiac",
    category: "health-beauty",
    url: "https://genuineessiac.com/pages/genuine-essiac-tea?sca_ref=11220825.VSlmwyWinf",
    logo: "https://genuineessiac.com/cdn/shop/files/GE-white-bk_copy_300x300.jpg?v=1753917442",
    color: "#2F5D46",
    about: "The eight-herb powdered Essiac tea formula from Rene Caisse, sold for over 21 years.",
    coupons: [
      { title: "Extra savings with code MANH10 at checkout", discount: "Code", code: "MANH10", expires: "", verified: false },
    ],
  },
];
