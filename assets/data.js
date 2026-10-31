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
 * Best sellers shown in "Shop the favourites", by store website. Picked on 2026-10-31 from each
 * brand's own "best-selling" sort, keeping only products that are:
 *   - in the store's top sellers, in stock and with a clear photo;
 *   - a main product (no accessories, gift cards, tests, warranties or repeat sizes/flavours);
 *   - free of medical-style promises (quit-smoking, hormone or fat-burning products are left out).
 * Listed in best-selling order; up to three per brand. The site adds the store's affiliate ref to
 * each link, ranks brands with bigger codes first and mixes brands so none fills a row.
 * Products added in the sheet's "Sản phẩm" tab are shown too, after these.
 */
const SHOPIFY_CDN = "https://cdn.shopify.com/s/files/1/";
const BEST_SELLERS = {
  "heights.com": [
    { name: "Vitals⁺ Daily Multivitamin", url: "https://www.heights.com/products/vitals", image: SHOPIFY_CDN + "0092/3834/7861/files/vitals_-_new.png" },
    { name: "Biotic⁺ Probiotic + Zinc", url: "https://www.heights.com/products/biotic", image: SHOPIFY_CDN + "0092/3834/7861/files/Biotic_Shopify_product.jpg" },
    { name: "Magnesium⁺ Glycinate", url: "https://www.heights.com/products/magnesium", image: SHOPIFY_CDN + "0092/3834/7861/files/Magnesium.png" },
  ],
  "maryruthorganics.com": [
    { name: "Liquid Morning Multivitamin", url: "https://www.maryruthorganics.com/products/organic-liquid-morning-multivitamin", image: SHOPIFY_CDN + "0883/6750/files/liquid-morning-multivitamin-raspberry-32oz-maryruths.png" },
    { name: "Liquid Morning Multivitamin + Hair Growth", url: "https://www.maryruthorganics.com/products/liquid-morning-multivitamin-hair-growth", image: SHOPIFY_CDN + "0883/6750/files/liquid-morning-multivitamin-hair-growth-peach-mango-30oz-maryruths.png" },
    { name: "Kids Multivitamin Gummies", url: "https://www.maryruthorganics.com/products/kids-multivitamin-gummies-60-count", image: SHOPIFY_CDN + "0883/6750/files/1-kids-multivitamin-gummies-60ct-papaya-strawberry-maryruths-bottle-box-benefits-shopify_jpg.png" },
  ],
  "avea-life.com": [
    { name: "Collagen Activator", url: "https://avea-life.com/products/collagen-activator", image: SHOPIFY_CDN + "0606/3226/9049/files/Collagen_Lem_Packshot_SQUARE_EN.png" },
    { name: "Sereniser", url: "https://avea-life.com/products/sereniser", image: SHOPIFY_CDN + "0606/3226/9049/files/Frame_5_96c639a4-8ac9-4408-bbbe-b38206ba6c15.png" },
    { name: "Stabiliser", url: "https://avea-life.com/products/stabiliser", image: SHOPIFY_CDN + "0606/3226/9049/files/Stabiliser__main_image_web_3.0.png" },
  ],
  "birdandbe.com": [
    { name: "Female Fertility Power Prenatal Pack", url: "https://www.birdandbe.com/products/female-fertility-power-pack-prenatal-vitamins", image: SHOPIFY_CDN + "1443/0384/files/Female_Fertility_Power_Prenatal_Pack_image_1_f47618c6-669a-4430-afbc-51209d41eca6.png" },
    { name: "Male Fertility Power Pack", url: "https://www.birdandbe.com/products/male-fertility-supplements-power-pack", image: SHOPIFY_CDN + "1443/0384/files/Male_Fertility_Power_Pack_image_1.png" },
    { name: "Complete Prenatal Pack", url: "https://www.birdandbe.com/products/complete-prenatal-vitamins-dha-30-daily-pack", image: SHOPIFY_CDN + "1443/0384/files/Complete_Prenatal_Pack_image_1_1.png" },
  ],
  "wavwatch.com": [
    { name: "WAVwatch 2.2", url: "https://wavwatch.com/products/wavwatch-2-2", image: SHOPIFY_CDN + "0810/1137/6405/files/WAVwatch2.2Image8.jpg" },
  ],
  "tolevita.com": [
    { name: "Sleep Patches with Melatonin & Lavender", url: "https://shop.tolevita.com/products/sleep-patches-36-pcs-natural-sleep-aid-with-melatonin-lavender-l-theanine-gaba-herbal-extracts", image: SHOPIFY_CDN + "0619/3476/4164/files/sleep_patch-main_pic.jpg" },
    { name: "NAD+ Patches for Daily Energy", url: "https://shop.tolevita.com/products/electrolyte-patches-replenish-balance-with-potassium-magnesium-iron-calcium-36-patches-copy", image: SHOPIFY_CDN + "0619/3476/4164/files/NADPatch_1.jpg" },
    { name: "Energy Patches with Vitamin B12", url: "https://shop.tolevita.com/products/energy-patches-with-vitamin-b12-36-pcs", image: SHOPIFY_CDN + "0619/3476/4164/files/Energypatches-1.jpg" },
  ],
  "genuineessiac.com": [
    { name: "Essiac Tea, 1 lb in four 4 oz packets", url: "https://genuineessiac.com/products/1-lb-of-essiac-blended-herbs-in-four-4-4-oz-packets", image: SHOPIFY_CDN + "2789/5818/files/1-lb-genuine-essiac-in-four-four-oz-bags.jpg" },
    { name: "Essiac Tea, 1 lb bag", url: "https://genuineessiac.com/products/1-lb-of-essiac-blended-herbs", image: SHOPIFY_CDN + "2789/5818/files/1-lb-genuine-essiac-bag.jpg" },
    { name: "Essiac Tea, 13 × 4 oz packets (most popular)", url: "https://genuineessiac.com/products/3-lb-4-oz-of-essiac-blended-herbs-in-thirteen-13-4-oz-packets", image: SHOPIFY_CDN + "2789/5818/files/3-lb-4-oz-geniune-essiac.jpg" },
  ],
  "elliosa.com": [
    { name: "Pilates & Lattes Grip Socks", url: "https://www.elliosa.com/products/pilates-lattes", image: SHOPIFY_CDN + "0608/9362/6573/files/mixed_4.jpg" },
    { name: "Grip Stripes Socks, Black", url: "https://www.elliosa.com/products/dual-direction-grip-stripes-black", image: SHOPIFY_CDN + "0608/9362/6573/files/8_13b666a9-bc47-4390-b3fc-43c8fc47dc90.jpg" },
    { name: "Pilates Social Club Grip Socks", url: "https://www.elliosa.com/products/pilates-social-club", image: SHOPIFY_CDN + "0608/9362/6573/files/mixed_4_423caff9-84af-4316-aba4-577c2b1c487d.jpg" },
  ],
  "mizulabdrinks.com": [
    { name: "Japanese Soda Electrolytes, Zero Sugar", url: "https://mizulabdrinks.com/products/japanese-soda-electrolytes-zero-sugar", image: SHOPIFY_CDN + "0809/4852/7408/files/446_ramune_fc39399a-36bf-4cd3-bf4f-d33a691239ba.jpg" },
    { name: "White Peach Candy Electrolytes, Zero Sugar", url: "https://mizulabdrinks.com/products/white-peach-candy-electrolytes-zero-sugar", image: SHOPIFY_CDN + "0809/4852/7408/files/white_peach_flavor.png" },
    { name: "Original Variety Pack, Zero Sugar", url: "https://mizulabdrinks.com/products/variety-pack-zero-sugar", image: SHOPIFY_CDN + "0809/4852/7408/files/20_341b74ed-300f-4aab-9726-e1221fe6a287.jpg" },
  ],
};

/*
 * The two tickets at the top of the home page. Each shows a photo, a label and the store's best
 * discount from the sheet, and opens that store's page. Leave the list empty to show the first
 * two stores instead.
 *   store - store slug, label - text on the ticket, image - photo, focus - optional object-position
 */
const HERO_PICKS = [
  {
    store: "heights",
    label: "Heights Vitals⁺",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/Frame_15899.jpg?v=1746177487",
    focus: "center 45%",
  },
  {
    store: "heights",
    label: "Heights Starter Kit",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/Frame15916.jpg?v=1746177540",
    focus: "center 72%",
  },
];

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
