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
 *   category  - slug of one category below
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
  name: "Nova Beauty",
  tagline: "Hand-picked codes for skin patches, eye masks and herbal teas from independent brands.",
  // Left empty so no email is shown. To show one later, set it here (or CONTACT_EMAIL on Hostinger)
  // and add <a data-site-email href="#"></a> where it should appear.
  email: (window.SITE_ENV && window.SITE_ENV.email) || "",
  // CSV link of the sheet's "Web (tự động, không sửa)" tab (File > Share > Publish to web). "" = use STORES only.
  sheet:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8QUQR3nHFFYR8UKnCxYtSMXGkgKnw-Ynx0wVcLUui3JGNUbrksUCZJSeq8by_TWNldXXDCcAIReWR/pub?gid=1706532640&single=true&output=csv",
};

const CATEGORIES = [
  {
    slug: "clothing-accessories",
    name: "Clothing & accessories",
    intro: "Bags, jewellery, everyday basics and statement pieces.",
  },
  {
    slug: "home-garden",
    name: "Home & garden",
    intro: "Bedding, kitchenware, plants and tools for every room and yard.",
  },
  {
    slug: "health-beauty",
    name: "Health & beauty",
    intro: "Skin patches, eye masks, herbal teas and other self-care products from independent brands.",
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
    category: "health-beauty",
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
