/*
 * Stores, codes and products now come from the Google Sheet published at SITE.sheet (see sheet.js).
 * STORES below is the backup when the sheet can't be reached, and supplies photos, logos and
 * descriptions the sheet leaves empty (matched by store name and product link).
 *
 * Categories with no stores are hidden automatically.
 *
 * Store fields:
 *   slug      - used in the URL: store.html?s=<slug> (lowercase, no spaces)
 *   name      - store name
 *   category  - slug of one of the CATEGORIES
 *   url       - YOUR affiliate link (every "Show code" / "Get deal" click opens it)
 *   logo      - optional image path or URL; leave "" to show a coloured monogram
 *   color     - monogram background when there is no logo
 *   cover     - large photo used on the home page and the store page
 *   coverZoom - optional, e.g. 1.1 to crop off a border built into the cover photo
 *   about     - one or two sentences about the store
 *   coupons   - list of offers:
 *       title    - what the shopper gets
 *       discount - short text for the stub, e.g. "15%", "$20", "Free ship"
 *       code     - the coupon code; leave "" for a deal that needs no code
 *       expires  - "YYYY-MM-DD" or "" if it doesn't expire
 *       verified - true if you've checked the code works
 *       details  - optional terms shown under "See details" and in the code dialog
 *   products  - a few popular products, each linking to the product page WITH your affiliate ref:
 *       name, image, url
 */

const SITE = {
  name: "Kinsley Deals",
  tagline: "Hand-picked codes for skin patches, eye masks and herbal teas from independent brands.",
  // Left empty so no email is shown. To show one later, set it here (or CONTACT_EMAIL on Hostinger)
  // and add <a data-site-email href="#"></a> where it should appear.
  email: (window.SITE_ENV && window.SITE_ENV.email) || "",
  // CSV link of the sheet's "Web (tự động, không sửa)" tab (File > Share > Publish to web). "" = use STORES only.
  sheet:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8QUQR3nHFFYR8UKnCxYtSMXGkgKnw-Ynx0wVcLUui3JGNUbrksUCZJSeq8by_TWNldXXDCcAIReWR/pub?gid=1706532640&single=true&output=csv",
};

/*
 * Categories, in the order they're shown. A store whose "Ngành hàng" cell in the sheet is empty or
 * "Tự động" is sorted automatically: its name, description, products and Shopify shop description
 * are matched against each category's `words` (plurals count too), and the most matches win.
 * A store with no matches goes to the last category.
 */
const CATEGORIES = [
  {
    slug: "skincare-beauty",
    name: "Skincare & beauty",
    intro: "Face masks, eye patches, serums and other skincare from independent brands.",
    words: ["skin", "skincare", "face", "facial", "mask", "serum", "patch", "collagen", "wrinkle", "beauty", "cosmetic",
      "makeup", "lipstick", "moisturizer", "moisturiser", "acne", "sunscreen", "spf", "nail", "fragrance", "perfume",
      "hair", "haircare", "shampoo", "conditioner"],
  },
  {
    slug: "vitamins-supplements",
    name: "Vitamins & supplements",
    intro: "Multivitamins, gummies, prenatal and longevity supplements, plus gut and brain support.",
    words: ["vitamin", "multivitamin", "supplement", "gummy", "gummies", "capsule", "probiotic", "prebiotic", "magnesium",
      "omega", "nutrition", "nutrient", "mineral", "prenatal", "longevity", "nootropic", "protein", "electrolyte", "creatine"],
  },
  {
    slug: "herbal-teas",
    name: "Herbal teas",
    intro: "Herbal tea blends and traditional wellness drinks.",
    words: ["tea", "herbal", "herb", "matcha", "infusion", "essiac", "chai", "tisane", "kombucha"],
  },
  {
    slug: "clothing-accessories",
    name: "Clothing & accessories",
    intro: "Grip socks, activewear, bags and everyday basics.",
    words: ["sock", "apparel", "clothing", "shirt", "dress", "legging", "activewear", "sportswear", "jewelry", "jewellery",
      "handbag", "backpack", "shoe", "sneaker", "hoodie", "swimwear", "underwear", "bra"],
  },
  {
    slug: "home-garden",
    name: "Home & garden",
    intro: "Bedding, kitchenware, plants and tools for every room and yard.",
    words: ["homeware", "kitchen", "cookware", "bedding", "pillow", "mattress", "furniture", "decor", "candle", "garden", "plant"],
  },
  {
    slug: "electronics",
    name: "Electronics",
    intro: "Audio, chargers, smart-home gear and accessories for your devices.",
    words: ["electronic", "charger", "headphone", "earbud", "speaker", "laptop", "gadget", "camera", "smartwatch"],
  },
  {
    slug: "more-deals",
    name: "More deals",
    intro: "Codes from stores that don't fit the other categories.",
    words: [],
  },
];

const STORES = [
  {
    slug: "tolevita",
    name: "Tolevita",
    category: "skincare-beauty",
    url: "https://shop.tolevita.com?sca_ref=11252630.LxmEzKMaaNq",
    logo: "https://shop.tolevita.com/cdn/shop/files/Tolevita_Logo_Creatine.png?v=1741773248&width=192",
    color: "#1F6F8B",
    cover: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/Facemask-PINK-1_2.jpg?v=1779696868",
    about: "Bio-collagen face masks, hydrogel eye patches and vitamin patches. Free shipping on US orders over $20.",
    coupons: [
      {
        title: "10% off your order",
        discount: "10%",
        code: "SALA38",
        expires: "",
        verified: false,
        details: "Enter SALA38 in the discount box at checkout on shop.tolevita.com to take 10% off your order.",
      },
      {
        title: "Free shipping on US orders over $20",
        discount: "Free ship",
        code: "",
        expires: "",
        verified: true,
        details: "Shipping is free on US orders over $20. No code needed.",
      },
    ],
    products: [
      {
        name: "Bio-Collagen Face Mask with Salmon DNA",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/Facemask-PINK-1_2.jpg?v=1779696868",
        url: "https://shop.tolevita.com/products/bio-collagen-hydrogel-face-mask-regenerating-firming-mask-with-salmon-dna-pdrn-6-masks?sca_ref=11252630.LxmEzKMaaNq",
      },
      {
        name: "Hydrogel Eye Patches with Caffeine & Vitamin C",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/Patches-WithcaffeineandvitaminC-1.jpg?v=1776785488",
        url: "https://shop.tolevita.com/products/hydrogel-eye-patches-brightening-revitalizing-under-eye-masks-with-caffeine-vitamin-c-60-patches-30-pairs?sca_ref=11252630.LxmEzKMaaNq",
      },
      {
        name: "Microdarts Wrinkle Patches",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/Wrinklepatches-1.jpg?v=1783093383",
        url: "https://shop.tolevita.com/products/microdarts-wrinkle-patches-smoothing-firming-patches-with-bakuchiol-hyaluronic-acid-niacinamide-adenosine-10-patches?sca_ref=11252630.LxmEzKMaaNq",
      },
      {
        name: "Self-Heating Steam Eye Mask",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/Steam_mask-2.jpg?v=1775209742",
        url: "https://shop.tolevita.com/products/steam-eye-mask-self-heating-soothing-eye-mask-for-relaxation-eye-fatigue-relief-with-lavender-mint-jasmine-chamomile-20-masks?sca_ref=11252630.LxmEzKMaaNq",
      },
      {
        name: "Cooling Refresh Eye Mask with Mint",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/refreshv2mainpic.jpg?v=1785078329",
        url: "https://shop.tolevita.com/products/refresh-eye-mask-cooling-refreshing-hydrogel-eye-mask-with-mint-extract-20-masks?sca_ref=11252630.LxmEzKMaaNq",
      },
      {
        name: "Brightening Skincare Bundle with Vitamin C",
        image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/1.png?v=1793188412",
        url: "https://shop.tolevita.com/products/brightening-revitalizing-skincare-bundle-with-vitamin-c-bio-collagen-face-masks-hydrogel-eye-patches?sca_ref=11252630.LxmEzKMaaNq",
      },
    ],
  },
  {
    slug: "genuine-essiac",
    name: "Genuine Essiac",
    category: "herbal-teas",
    url: "https://genuineessiac.com/pages/genuine-essiac-tea?sca_ref=11220825.VSlmwyWinf",
    logo: "https://genuineessiac.com/cdn/shop/files/GE-white-bk_copy_300x300.jpg?v=1753917442",
    color: "#2F5D46",
    cover: "https://cdn.shopify.com/s/files/1/2789/5818/files/woman-drinking-genuine-essiac.jpg?v=1776542940",
    coverZoom: 1.34, // the original photo has a white frame; zooming in crops it off
    about: "The eight-herb powdered Essiac tea formula from Rene Caisse, sold for over 21 years.",
    coupons: [
      {
        title: "10% off your order",
        discount: "10%",
        code: "MANH10",
        expires: "",
        verified: false,
        details: "Enter MANH10 in the discount box at checkout on genuineessiac.com to take 10% off your order.",
      },
    ],
    products: [
      {
        name: "Essiac Tea, 13 × 4 oz packets (most popular)",
        image: "https://cdn.shopify.com/s/files/1/2789/5818/files/3-lb-4-oz-geniune-essiac.jpg?v=1776609867",
        url: "https://genuineessiac.com/products/3-lb-4-oz-of-essiac-blended-herbs-in-thirteen-13-4-oz-packets?sca_ref=11220825.VSlmwyWinf",
      },
      {
        name: "Essiac Tea, 1 lb bag",
        image: "https://cdn.shopify.com/s/files/1/2789/5818/files/1-lb-genuine-essiac-bag.jpg?v=1776609860",
        url: "https://genuineessiac.com/products/1-lb-of-essiac-blended-herbs?sca_ref=11220825.VSlmwyWinf",
      },
      {
        name: "Essiac Tea, 18 × 1 oz packets",
        image: "https://cdn.shopify.com/s/files/1/2789/5818/files/1-lb-2-oz-genuine-essiac.jpg?v=1776609862",
        url: "https://genuineessiac.com/products/1-lb-2-oz-of-essiac-blended-herbs-in-eighteen-18-1-oz-packets?sca_ref=11220825.VSlmwyWinf",
      },
    ],
  },
];
