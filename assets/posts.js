/*
 * Saving Tips articles, newest first. Each article is its own page (url); this list feeds the
 * Saving Tips page, "Saving tips" on the home page and "Read before you buy" on the store's page.
 *   category - slug of one of POST_CATEGORIES
 *   store    - slug of the store the article is about (optional)
 *   image    - cover photo used on cards and at the top of the article
 *   focus    - optional CSS object-position keeping the subject of the photo in frame on cards
 *   date     - "YYYY-MM-DD"
 */

const POST_CATEGORIES = [
  { slug: "coupon-guides", name: "Coupon guides" },
  { slug: "buying-guides", name: "Buying guides" },
];

const POSTS = [
  {
    slug: "heights-discount-code",
    url: "saving-tips-heights-discount-code.html",
    title: "Heights Discount Code: 25% Off, Plus 4 Ways to Pay Even Less",
    excerpt:
      "Code CHANTELLEPANG takes 25% off at Heights. Then pay less again with a subscription, a bundle or the 90-day supply, with the prices side by side.",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/magnesium-biotic-vitals-bundle-new.png?v=1746177540",
    imageAlt: "Heights Vitals⁺, Biotic⁺ and Magnesium⁺ jars side by side",
    focus: "center 30%",
    category: "coupon-guides",
    store: "heights",
    date: "2026-10-31",
    minutes: 6,
  },
  {
    slug: "maryruths-discount-code",
    url: "saving-tips-maryruths-discount-code.html",
    title: "MaryRuth's Discount Code: 15% Off Liquid Vitamins, Plus 3 Ways to Save",
    excerpt:
      "Code CHANTELLEPANG takes 15% off at MaryRuth's. What the Liquid Morning Multivitamin and other best sellers cost with it, and three more ways to pay less.",
    image: "https://cdn.shopify.com/s/files/1/0883/6750/files/liquid-morning-multivitamin-hair-growth-peach-mango-30oz-maryruths.png?v=1780343744",
    imageAlt: "A bottle of MaryRuth's Liquid Morning Multivitamin + Hair Growth",
    focus: "center 40%",
    category: "coupon-guides",
    store: "maryruthorganics",
    date: "2026-10-31",
    minutes: 5,
  },
  {
    slug: "bodybio-discount-code",
    url: "saving-tips-bodybio-discount-code.html",
    title: "BodyBio Discount Code: 15% Off PC, Butyrate and E-Lyte",
    excerpt:
      "Code JA45M66E takes 15% off at BodyBio. What PC, Butyrate and E-Lyte cost with it, which size is cheapest per softgel, and when to subscribe instead.",
    image: "https://cdn.shopify.com/s/files/1/0019/0958/8028/files/PC16_0c5b6a64-bb5b-4bce-b6bf-a853e752c351.png?v=1750341914",
    imageAlt: "A bottle of BodyBio PC (Phospholipid Complex)",
    focus: "center 45%",
    category: "coupon-guides",
    store: "bodybio",
    date: "2026-10-31",
    minutes: 5,
  },
  {
    slug: "bird-and-be-discount-code",
    url: "saving-tips-bird-and-be-discount-code.html",
    title: "Bird&Be Discount Code: $15 Off Prenatals and Fertility Packs",
    excerpt:
      "Code SFQVBDGV takes $15 off at Bird&Be. What the prenatal and fertility packs cost with it, and when a subscription or bundle saves more.",
    image: "https://cdn.shopify.com/s/files/1/1443/0384/files/Complete_Prenatal_Pack_image_1_1.png?v=1762367674",
    imageAlt: "The Bird&Be Complete Prenatal Pack box",
    focus: "center",
    category: "coupon-guides",
    store: "birdandbe",
    date: "2026-10-31",
    minutes: 5,
  },
  {
    slug: "avea-discount-code",
    url: "saving-tips-avea-discount-code.html",
    title: "AVEA Discount Code: 15% Off, and When a Plan Saves You More",
    excerpt:
      "Code KENNYJOHN takes 15% off at AVEA. How that compares with AVEA's monthly, quarterly and annual plans, with the Collagen Activator prices side by side.",
    image: "https://cdn.shopify.com/s/files/1/0606/3226/9049/files/Collagen_Lem_Packshot_SQUARE_EN.png",
    imageAlt: "AVEA Collagen Activator sachets",
    focus: "center",
    category: "coupon-guides",
    store: "avea-life",
    date: "2026-10-31",
    minutes: 5,
  },
  {
    slug: "wavwatch-discount-code",
    url: "saving-tips-wavwatch-discount-code.html",
    title: "WAVwatch Discount Code: 15% Off the WAVwatch 2.2, With Prices",
    excerpt:
      "Code JAME147 takes 15% off the WAVwatch 2.2. The price with the code, the add-ons, and the 30-day trial explained.",
    image: "https://cdn.shopify.com/s/files/1/0810/1137/6405/files/WAVwatch2.2Image6.jpg",
    imageAlt: "A WAVwatch 2.2 worn on the wrist",
    focus: "center 45%",
    category: "coupon-guides",
    store: "wavwatch",
    date: "2026-10-31",
    minutes: 4,
  },
  {
    slug: "elliosa-discount-code",
    url: "saving-tips-elliosa-discount-code.html",
    title: "Elliosa Discount Code: 10% Off Pilates Grip Socks and Bundles",
    excerpt:
      "Code JASON65445 takes 10% off Elliosa's Pilates grip socks. Single pairs vs bundles, shipping times, and how to pay the least per pair.",
    image: "https://cdn.shopify.com/s/files/1/0608/9362/6573/files/3.LatteReformer.jpg",
    imageAlt: "Elliosa grip socks on a Pilates reformer",
    focus: "center",
    category: "coupon-guides",
    store: "elliosa",
    date: "2026-10-31",
    minutes: 4,
  },
  {
    slug: "mizu-lab-discount-code",
    url: "saving-tips-mizu-lab-discount-code.html",
    title: "Mizu Lab Discount Code: 10% Off Zero-Sugar Electrolytes",
    excerpt:
      "Code WICKENDENJAMES takes 10% off Mizu Lab's Asian-inspired electrolyte mixes. What each stick costs, and how to reach free shipping.",
    image: "https://cdn.shopify.com/s/files/1/0809/4852/7408/files/446_ramune_fc39399a-36bf-4cd3-bf4f-d33a691239ba.jpg",
    imageAlt: "Mizu Lab Japanese Soda electrolyte drink",
    focus: "center",
    category: "coupon-guides",
    store: "mizulabdrinks",
    date: "2026-10-31",
    minutes: 4,
  },
  {
    slug: "tolevita-discount-code",
    url: "saving-tips-tolevita-discount-code.html",
    title: "Tolevita Discount Code: 10% Off Sleep Patches and Face Masks",
    excerpt:
      "Code SALA38 takes 10% off at Tolevita. What the sleep patches, eye patches and face masks cost with it, and how to make free shipping work for you.",
    image: "https://cdn.shopify.com/s/files/1/0619/3476/4164/files/sleep_patch-main_pic.jpg?v=1762243249",
    imageAlt: "A pack of Tolevita Sleep Patches",
    focus: "center",
    category: "coupon-guides",
    store: "tolevita",
    date: "2026-10-31",
    minutes: 4,
  },
  {
    slug: "genuine-essiac-discount-code",
    url: "saving-tips-genuine-essiac-discount-code.html",
    title: "Genuine Essiac Discount Code: 10% Off, Plus the Cheapest Size",
    excerpt:
      "Code MANH10 takes 10% off Genuine Essiac tea. We compared every bag size per pound, so you know which one costs the least.",
    image: "https://cdn.shopify.com/s/files/1/2789/5818/files/3-lb-4-oz-geniune-essiac.jpg?v=1776609867",
    imageAlt: "Thirteen 4 oz bags of Genuine Essiac tea",
    focus: "center",
    category: "coupon-guides",
    store: "genuine-essiac",
    date: "2026-10-31",
    minutes: 5,
  },
  {
    slug: "jennibag-discount-code",
    url: "saving-tips-jennibag-discount-code.html",
    title: "JenniBag Discount Code: 5% Off the JenniBag 2.0 and Travel Bundle",
    excerpt:
      "Code PHAN takes 5% off at JenniBag. Classic vs Roller Edition prices, when the Travel Bundle is worth it, and the 30-day return rules.",
    image: "https://cdn.shopify.com/s/files/1/0593/6775/1722/files/New_Series_22_10b475e1-6623-479b-899a-584bc677c0a8.webp",
    imageAlt: "A JenniBag slipped over the handle of a suitcase",
    focus: "center 40%",
    category: "coupon-guides",
    store: "jennibag",
    date: "2026-10-31",
    minutes: 4,
  },
  {
    slug: "heights-on-a-budget",
    url: "saving-tips-heights-on-a-budget.html",
    title: "Heights on a Budget: What to Buy First and What It Costs per Day",
    excerpt:
      "Which Heights supplement to start with, what Vitals⁺, Biotic⁺, Magnesium⁺ and Thrive⁺ really cost per day, and how not to pay for things you don't need.",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/Frame15916.jpg?v=1746177540",
    imageAlt: "An open hand holding Heights capsules against a blue sky",
    focus: "center 78%",
    category: "buying-guides",
    store: "heights",
    date: "2026-10-31",
    minutes: 6,
  },
];
