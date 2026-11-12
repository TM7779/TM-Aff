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
  tagline: "Discount codes for 60+ brands, from supplements and skincare to tech, toys and outdoor gear, with guides to pay less on every order.",
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
  "bodybio.com": [
    { name: "BodyBio PC (Phospholipid Complex)", url: "https://bodybio.com/products/bodybio-pc-phosphatidylcholine", image: SHOPIFY_CDN + "0019/0958/8028/files/PC16_0c5b6a64-bb5b-4bce-b6bf-a853e752c351.png" },
    { name: "Butyrate Capsules", url: "https://bodybio.com/products/butyrate", image: SHOPIFY_CDN + "0019/0958/8028/files/BUS100_8ffb963c-0c85-49ae-b4b2-3ed8178363c8.png" },
    { name: "e-lyte Electrolyte Concentrate", url: "https://bodybio.com/products/e-lyte-balanced-electrolyte-concentrate", image: SHOPIFY_CDN + "0019/0958/8028/files/EOC16_bb2ff2c0-29a6-4c43-bb0e-382ac76f6847.png" },
  ],
  "jennibag.com": [
    { name: "JenniBag 2.0 Travel Bag", url: "https://jennibag.com/products/jennitravelbag-2", image: SHOPIFY_CDN + "0593/6775/1722/files/New_Series_52_55c8527f-08b4-481d-a810-41919af4ff74.webp" },
    { name: "JenniBag Signature", url: "https://jennibag.com/products/jennibag-signature-travel-bag", image: SHOPIFY_CDN + "0593/6775/1722/files/Jenni_Signature_9_1.webp" },
    { name: "JenniBag Travel Bundle", url: "https://jennibag.com/products/jennibag-travel-bundle", image: SHOPIFY_CDN + "0593/6775/1722/files/121_6e172345-9a86-45d5-a297-8583d65091a4.webp" },
  ],
  "korekawaii.com": [
    { name: "Fluffy Bunny Plushie Keychains", url: "https://korekawaii.com/products/fluffy-bunny-plushie-keychains", image: SHOPIFY_CDN + "0279/9966/6254/files/S1f8406f54c8345e6ac400a1592d1bdfbh.webp" },
    { name: "Chubby Pastel Dragon Plushies", url: "https://korekawaii.com/products/chubby-pastel-dragon-plushies", image: SHOPIFY_CDN + "0279/9966/6254/files/chubby-pastel-dragon-plushies.webp" },
    { name: "Game Star Hoodie", url: "https://korekawaii.com/products/kawaii-game-star-hoodie", image: SHOPIFY_CDN + "0279/9966/6254/products/S1f99df344d11438ca28980f4da174f3aC.jpg" },
  ],
  "niepceinc.com": [
    { name: "YE2032 Matte Black Joggers", url: "https://niepceinc.com/products/matte-black-strapped-joggers", image: SHOPIFY_CDN + "2541/1806/products/ye2032_techwear_pants.jpg" },
    { name: "HiBag2 Industrial Crossbody Bag", url: "https://niepceinc.com/products/displaced-movement-bag-1", image: SHOPIFY_CDN + "2541/1806/files/d71b5854_cd222a75-af14-4d86-a9ab-5a447657283c.jpg" },
    { name: "YC135 Pink Flowers Lightweight Pants", url: "https://niepceinc.com/products/yc-135", image: SHOPIFY_CDN + "2541/1806/products/1317fd56.jpg" },
  ],
  "lussotan.com": [
    { name: "Rapid Tan Mousse, 200ml", url: "https://lussotan.com/products/rapid-tan-mousse", image: SHOPIFY_CDN + "0222/8109/3194/files/Rapid-Tan-Mousse-200ml-Lusso-Tan-178565511.png" },
    { name: "Tinted Self Tanning Mousse, 200ml", url: "https://lussotan.com/products/tinted-self-tanning-mousse", image: SHOPIFY_CDN + "0222/8109/3194/files/Tinted-Self-Tanning-Mousse-200ml-_Variants_-Lusso-Tan-178577781.png" },
    { name: "The Daily Gradual Tanner", url: "https://lussotan.com/products/the-daily-gradual-tanner-200ml", image: SHOPIFY_CDN + "0222/8109/3194/files/The-Daily-Gradual-Tanner-Lusso-Tan-178577476.png" },
  ],
  "protoarc.com": [
    { name: "EM11 NL Ergonomic Vertical Mouse", url: "https://www.protoarc.com/products/em11-nl-vertical-mouse", image: SHOPIFY_CDN + "0551/3972/9497/files/em11-nl-vertical-mouse.webp" },
    { name: "XK01 Foldable Keyboard", url: "https://www.protoarc.com/products/xk01-tri-fold-bluetooth-keyboard", image: SHOPIFY_CDN + "0551/3972/9497/files/xk01-keyboard-black.webp" },
    { name: "EC300 Ergonomic Office Chair", url: "https://www.protoarc.com/products/ec300-ergonomic-office-chair", image: SHOPIFY_CDN + "0551/3972/9497/files/1_f5ba80ae-5fff-4ee0-be77-e5baddf571ca.jpg" },
  ],
  "ohora.com": [
    { name: "Gel Nail Starter Kit", url: "https://ohora.com/products/ohora-starter-kit", image: SHOPIFY_CDN + "0596/8884/5517/files/NewStarterKit_mainthumb.jpg" },
    { name: "N Onyx Gel Nail Strips", url: "https://ohora.com/products/n-onyx", image: SHOPIFY_CDN + "0596/8884/5517/files/1_tip_e9c089d9-d4b8-4ca3-ae3c-2454ba8e3e6d.jpg" },
    { name: "N Addict Gel Nail Strips", url: "https://ohora.com/products/nb-022", image: SHOPIFY_CDN + "0596/8884/5517/files/1_tip_6c04ee0d-7359-426c-926f-7ffa4e19f507.jpg" },
  ],
  "tabasquishy.com": [
    { name: "Random Blind Bag Taba Squishy", url: "https://tabasquishy.com/products/random-blind-bag-taba-squishy", image: SHOPIFY_CDN + "0606/0690/6412/files/750534a2c715062c150f6f8b6c09556e.jpg" },
    { name: "Tie-dye Rainbow Dumpling", url: "https://tabasquishy.com/products/tie-dye-rainbow-dumpling", image: SHOPIFY_CDN + "0606/0690/6412/files/36ff5a54fcfb3b744906bcd14c36c2b9.jpg" },
    { name: "Flocked Chick Taba Squishy", url: "https://tabasquishy.com/products/taba-squishy-chick-squeeze-toy", image: SHOPIFY_CDN + "0606/0690/6412/files/e2f8213c9bff462fb3a27393b3b905a1.jpg" },
  ],
  "fosiaudio.com": [
    { name: "Merak CD Player", url: "https://fosiaudio.com/products/merak-cd-player", image: SHOPIFY_CDN + "2251/7913/files/CD_0bdc7150-f1a3-4570-8342-4ba520733fb3.png" },
    { name: "BT20A Pro Bluetooth Stereo Amplifier", url: "https://fosiaudio.com/products/bt20a-pro-2-channel-bluetooth-power-amplifier", image: SHOPIFY_CDN + "2251/7913/files/BT20A_PRO_7b5daf0a-89d6-48f8-a268-ee9583cf1a07.png" },
    { name: "ZA3 Balanced Stereo Amplifier", url: "https://fosiaudio.com/products/fosi-audio-za3-balanced-dual-mode-class-d-amplifier", image: SHOPIFY_CDN + "2251/7913/files/ZA3_346b5d67-3948-4455-ad62-0c8ce823f058.png" },
  ],
  "webbernaturals.com": [
    { name: "Vitamin E 400 IU", url: "https://webbernaturals.com/products/vitamin-e-400-iu-softgels", image: SHOPIFY_CDN + "0556/0185/6591/files/wn3800__image-hi-res__vitamin-e-400-iu__1000486.png" },
    { name: "Triple Strength Omega-3 900 mg", url: "https://webbernaturals.com/products/triple-strength-omega-3-900-mg-no-fishy-aftertaste", image: SHOPIFY_CDN + "0556/0185/6591/files/wn3395__image-hi-res__triple-strength-omega-3-900-mg-epa-dha__3731194.png" },
    { name: "Vitamin K2 + D3", url: "https://webbernaturals.com/products/vitamin-k2-d3-120-mcg-1000-iu", image: SHOPIFY_CDN + "0556/0185/6591/files/wn3933__image-hi-res__vitamin-k2_d3-120-mcg-1000-iu__2439320.png" },
  ],
  "womierkeyboard.com": [
    { name: "SK61 HE Hall Effect Wireless Keyboard", url: "https://womierkeyboard.com/products/womier-sk61-he-wireless-magnetic-keyboard", image: SHOPIFY_CDN + "0564/2289/1591/files/womier-sk61-he-wireless-magnetic-switch-60-aluminum-hollow-design-gaming-keyboard-5288314.jpg" },
    { name: "WD75 HE Wooden Hall Effect Keyboard", url: "https://womierkeyboard.com/products/womier-wd75-he-magnetic-keyboard", image: SHOPIFY_CDN + "0564/2289/1591/files/womier-wd75-he-75-wireless-hall-effect-wooden-keyboard-4227636.jpg" },
    { name: "Q61 Pro Wireless Gaming Keyboard", url: "https://womierkeyboard.com/products/womier-q61-pro-qmk-via-support-gasket-mounted-wireless-gaming-keyboard", image: SHOPIFY_CDN + "0564/2289/1591/files/womier-q61-pro-wireless-mechanical-gaming-keyboard-3198581.jpg" },
  ],
  "slimq.life": [
    { name: "330W Gaming Laptop Charger", url: "https://slimq.life/products/330w-laptop-charger", image: SHOPIFY_CDN + "0262/8645/6912/files/330W1500.png" },
    { name: "240W DC/USB-C Charger", url: "https://slimq.life/products/240w-dc-usb-c-gan-charger", image: SHOPIFY_CDN + "0262/8645/6912/files/240W_laptop_Charger.png" },
    { name: "150W USB-C Charger PD3.1", url: "https://slimq.life/products/150w-3c1a-pd3-1-usb-c-charger", image: SHOPIFY_CDN + "0262/8645/6912/files/150W3C1500A.png" },
  ],
  "jessupbeauty.com": [
    { name: "T500 Duo-End Brush Collection", url: "https://www.jessupbeauty.com/products/14-in-10-duo-end-brush-versatility-collection", image: SHOPIFY_CDN + "0034/3051/4757/files/T500-BFCM25-2000X2000.jpg" },
    { name: "T329 Light Gray 14-Piece Brush Set", url: "https://www.jessupbeauty.com/products/luxury-light-gray-comprehensive-eye-and-face-brush-set-14pcs-t329", image: SHOPIFY_CDN + "0034/3051/4757/files/T329-Gift.png" },
    { name: "Makeup Lover Phantom Black Collection", url: "https://www.jessupbeauty.com/products/luxury-phantom-black-21pcs", image: SHOPIFY_CDN + "0034/3051/4757/files/T271-FCM25-2000X2000.jpg" },
  ],
  "jlmmarine.com": [
    { name: "Water Pump Impeller Repair Kit for Johnson/Evinrude 90-225 HP", url: "https://jlmmarine.com/products/water-pump-impeller-repair-kit-fits-johnson-evinrude-v4-v6-v8-90-225-hp-replaces-5001594-390768", image: SHOPIFY_CDN + "0885/0433/6697/files/QM-5001594_09d0246f-9db3-4c70-9032-d87fad59bb0c.png" },
    { name: "Water Pump Impeller Kit for Johnson/Evinrude 9.9/15 HP", url: "https://jlmmarine.com/products/water-pump-impeller-kit-fits-johnson-evinrude-9-9-15-hp-replaces-394711-18-3327", image: SHOPIFY_CDN + "0885/0433/6697/files/18KO001OC_a563738c-9a1c-4f02-a58a-3c5941c2cdaa.png" },
    { name: "VRO Fuel Pump Replacement Kit for Johnson/Evinrude 90-115 HP", url: "https://jlmmarine.com/products/vro-fuel-pump-replacement-kit-fits-johnson-evinrude-60-v4-90-115-hp-replaces-5007420", image: SHOPIFY_CDN + "0885/0433/6697/files/V7-29O8-KUMO_a40b2f20-44e5-4d7a-8138-fbaa690f653d.png" },
  ],
  "elevatedfaith.com": [
    { name: "WWJD Bracelet", url: "https://elevatedfaith.com/products/wwjd-bracelet", image: SHOPIFY_CDN + "0956/3508/products/wwjd-bracelet-christian-bracelet-31577497370775.jpg" },
    { name: "Highs and Lows Ring", url: "https://elevatedfaith.com/products/highs-and-lows-ring", image: SHOPIFY_CDN + "0956/3508/products/highs-and-lows-ring-christian-ring-31593315139735.png" },
    { name: "Child of God Unisex Hoodie", url: "https://elevatedfaith.com/products/child-of-god-unisex-hoodie", image: SHOPIFY_CDN + "0956/3508/products/Child-of-God-Unisex-Hoodie_01.jpg" },
  ],
  "tomtoc.com": [
    { name: "Defender-A14 Laptop Briefcase", url: "https://www.tomtoc.com/products/defender-a14-laptop-briefcase-for-14-inch-macbook-pro", image: SHOPIFY_CDN + "0256/7979/0179/files/laptop_A14_bf8f037a-ba4d-49e7-97d2-5a457e787585.jpg" },
    { name: "Defender-A17 Laptop Handbag", url: "https://www.tomtoc.com/products/defender-a17-laptop-handbag-for-14-inch-macbook-pro", image: SHOPIFY_CDN + "0256/7979/0179/files/laptop_A17.jpg" },
    { name: "Navigator-T66 Travel Backpack 40L", url: "https://www.tomtoc.com/products/40l-travel-backpack-carry-on", image: SHOPIFY_CDN + "0256/7979/0179/files/20251212-102147.jpg" },
  ],
  "meross.com": [
    { name: "Smart Garage Door Opener MSG100", url: "https://shop.meross.com/products/smart-wifi-garage-door-opener", image: SHOPIFY_CDN + "0488/4289/9612/products/MSG100.jpg" },
    { name: "Smart Garage Door Opener MSG200HK", url: "https://shop.meross.com/products/smart-garage-door-opener", image: SHOPIFY_CDN + "0488/4289/9612/products/1_4561a7ed-4f3f-4aaf-9dc2-8ce2a253fc5f.jpg" },
    { name: "Matter Smart Presence Sensor MS600", url: "https://shop.meross.com/products/smart-presence-sensor-ms600", image: SHOPIFY_CDN + "0488/4289/9612/files/Untitleddesign_53c9fd08-ba88-482b-9330-a621eb904039.png" },
  ],
  "mellif-tools.com": [
    { name: "Air Duster MFAD001", url: "https://mellif-tools.com/products/mellif-air-duster-blower-inflator-compatible-with-dewalt-20v-battery-pump", image: SHOPIFY_CDN + "0575/3893/7021/files/01_392388fd-7f89-458b-975a-9d7b5a6aedbf.jpg" },
    { name: "20V 720GPH Stick Pump", url: "https://mellif-tools.com/products/mellif-stick-pump-compatible-with-dewalt-20v-battery", image: SHOPIFY_CDN + "0575/3893/7021/files/x___02.jpg" },
    { name: "Cordless Snow Shovel", url: "https://mellif-tools.com/products/mellif-for-dewalt-cordless-snow-shovel-20v-2-battery-brushless-electric-power-snow-thrower-handheld-snow-blower-with-13-2-in", image: SHOPIFY_CDN + "0575/3893/7021/files/01_e0b5bff0-6227-4756-8018-bf48da0214ef.jpg" },
  ],
  "atk.store": [
    { name: "RS6 V2 Hall Effect Keyboard", url: "https://www.atk.store/products/atk-rs6-v2-aluminum-hall-effect-gaming-keyboard", image: SHOPIFY_CDN + "0691/4942/5882/files/658baabe15b30353f6c8386a00a112e1.jpg" },
    { name: "RS8 Series Gaming Keyboard", url: "https://www.atk.store/products/atk-rs8-series-high-performance-gaming-keyboard", image: SHOPIFY_CDN + "0691/4942/5882/files/NEO_78acac7d-19d5-4e5b-8e2c-07627d377b3b.jpg" },
    { name: "Blazing Sky ZERO Wireless Mouse", url: "https://www.atk.store/products/atk-blazing-sky-zero-ultralight-wireless-gaming-mouse", image: SHOPIFY_CDN + "0691/4942/5882/files/1018eb4b165c295a804b3a2290659823.jpg" },
  ],
  "quntis.com": [
    { name: "Monitor Light Bar Focus 20.1-inch", url: "https://www.quntis.com/products/monitor-light-bar-pro-with-remote-control-eye-care-technology-computer-monitor-lamp-with-auto-dimming-no-screen-glare", image: SHOPIFY_CDN + "0151/6932/3072/files/61rp_9wgQLL._AC_SL1500.jpg" },
    { name: "Foldable Desk Lamp Studio 32.3-inch", url: "https://www.quntis.com/products/quntis-luxury-3-segment-foldable-dual-control-radar-sensor-smart-monitor-light-bar-multi-scene-eye-care-desk-lamp", image: SHOPIFY_CDN + "0151/6932/3072/files/20260506-094522.jpg" },
    { name: "Curved Monitor Light Bar IM 26-inch", url: "https://www.quntis.com/products/quntis-foldable-dual-head-led-monitor-light-bar-wide-angle-screen-lamp-for-curved-monitors-with-rgb-backlight-remote-control-eye-care-design", image: SHOPIFY_CDN + "0151/6932/3072/files/2218.jpg" },
  ],
  "amandean.com": [
    { name: "Premium Marine Collagen Powder 17.6 oz", url: "https://www.amandean.com/products/premium-anti-aging-marine-collagen-powder-17-6-oz-wild-caught-hydrolyzed-fish-collagen-peptides-type-1-3-collagen-protein-supplement-amino-acids-for-skin-hair-nails-paleo-friendly-non-gmo", image: SHOPIFY_CDN + "1397/2505/files/MC_500g.png" },
    { name: "Premium Grass Fed Collagen Peptides 1 kg", url: "https://www.amandean.com/products/premium-grass-fed-collagen-peptides-1kg", image: SHOPIFY_CDN + "1397/2505/products/amandean_collagen_peptides_1kg.png" },
    { name: "Premium Grass-Fed Gelatin Powder 1 kg", url: "https://www.amandean.com/products/premium-grass-fed-beef-gelatin-large-2-2lbs-unflavored-pure-collagen-protein-powder-healthy-paleo-baking-and-cooking", image: SHOPIFY_CDN + "1397/2505/products/gelatinpowder_Amandean.png" },
  ],
  "tidradio.com": [
    { name: "TD-H9 10W Bluetooth Radio", url: "https://tidradio.com/products/td-h9-10w-bluetooth-aprs-radio-handheld", image: SHOPIFY_CDN + "0096/6479/0607/files/TIDRADIO-Orange-TD-H9-10W-APRS-GPS-UHF-VHF-AM-FM-Handheld-Radio-Wireless-Programming-SMS-Text-HA_8368_1.jpg" },
    { name: "TD-H8 10W Ham GMRS Radio", url: "https://tidradio.com/products/4th-gen-td-h8-10w-ham-gmrs-radio-handheld-8-band-with-sms-am-fm-reception-dtmf-vox-scan", image: SHOPIFY_CDN + "0096/6479/0607/files/TIDRADIO_4th_Gen_TD-H8_Ham_GMRS_Radio_Handheld_Bluetooth-Headphone-connectable_AM_FM_UHF_VHF_NOAA_SMS.webp" },
    { name: "TD-H3 Plus 5W Radio", url: "https://tidradio.com/products/h3-plus-5w-ham-gmrs-bluetooth-radio", image: SHOPIFY_CDN + "0096/6479/0607/files/H3-Plus_10W_Ham_GMRS_Handheld_Radio_Unlocked_APRS_GPS_Tracker_Spectrum_Analyzer_128MB_Large_Memory_SMS_Texting_Customizable_Screen_Global_Repeater_Compatible_Bluetooth_AM_Airband_Programmable_Long-Range_Upgradable_Firmwar.jpg" },
  ],
  "palmpals.com": [
    { name: "Tenderheart Bear", url: "https://palmpals.com/products/tenderheart-bear", image: SHOPIFY_CDN + "0565/7578/7180/files/42005.jpg" },
    { name: "Good Luck Bear", url: "https://palmpals.com/products/good-luck-bear", image: SHOPIFY_CDN + "0565/7578/7180/files/42004.jpg" },
    { name: "Funshine Bear", url: "https://palmpals.com/products/funshine-bear", image: SHOPIFY_CDN + "0565/7578/7180/files/42003.jpg" },
  ],
  "grecell.com": [
    { name: "Portable Power Station 240W", url: "https://grecell.com/products/portable-power-station-240w", image: SHOPIFY_CDN + "0284/7306/5544/files/screenshot_2026-09-15_10-26-59.png" },
    { name: "Portable Power Station 300W", url: "https://grecell.com/products/power-station-300w", image: SHOPIFY_CDN + "0284/7306/5544/files/GC-T300S.jpg" },
    { name: "Portable Power Station 1000W", url: "https://grecell.com/products/portable-power-station-1000w", image: SHOPIFY_CDN + "0284/7306/5544/files/t1000-gc2_2.jpg" },
  ],
  "barriorzz.com": [
    { name: "Dip Belt Pro", url: "https://barriorzz.com/products/weighted-dip-belt-for-calisthenics", image: SHOPIFY_CDN + "0655/9740/7499/files/Dip_Belt_Pro.png" },
    { name: "Athlete Ring Set", url: "https://barriorzz.com/products/athlete-workout-rings-set", image: SHOPIFY_CDN + "0655/9740/7499/files/Athlete_Rings_Set.png" },
    { name: "Wrist Wraps", url: "https://barriorzz.com/products/wrist-wraps-for-calisthenics", image: SHOPIFY_CDN + "0655/9740/7499/files/Wrist_Wraps.png" },
  ],
  "epomaker.com": [
    { name: "Bamboo75 Keyboard", url: "https://epomaker.com/products/epomaker-bamboo75", image: SHOPIFY_CDN + "0280/3931/5529/files/Epomaker_Bamboo_75_v3_dark_wood_5.png" },
    { name: "Galaxy75 Keyboard", url: "https://epomaker.com/products/epomaker-galaxy75", image: SHOPIFY_CDN + "0280/3931/5529/files/EPOMAKER_Galaxy75_01.png" },
    { name: "HE65 V2 TMR Keyboard", url: "https://epomaker.com/products/epomaker-he65-v2-tmr", image: SHOPIFY_CDN + "0280/3931/5529/files/EpomakerHE65v2TMR_black_08.png" },
  ],
  "parijanofficial.com": [
    { name: "TAEBAEK Zipped Cable Sweater", url: "https://parijanofficial.com/products/taebaek-zipped-cable-sweater", image: SHOPIFY_CDN + "0578/1798/9252/files/1FE8AE49-6180-4BFC-87D3-3E9B05DF51BD.jpg" },
    { name: "PORTOFINO Linen Shirt", url: "https://parijanofficial.com/products/geoje-old-money-linen-shirt", image: SHOPIFY_CDN + "0578/1798/9252/files/1_55b663c0-dc53-47ca-ad13-36bd089712e8_jpg.webp" },
    { name: "GUNSAN Fitted Trousers", url: "https://parijanofficial.com/products/gunsan-fitted-trouser-1", image: SHOPIFY_CDN + "0578/1798/9252/files/804F123B-EBA0-4A76-860A-B0CE5A3708E5.jpg" },
  ],
  "neosabers.com": [
    { name: "Original LSW Xenopixel Lightsaber", url: "https://neosabers.com/products/original-lsw-proffie-neopixel-lightsaber", image: SHOPIFY_CDN + "0883/1929/5779/files/lsw_3_428aae7d-fd86-418d-a1c6-a2da8e5e5536.png" },
    { name: "Bastila Legendary Saber", url: "https://neosabers.com/products/bastila-legendary-saber", image: SHOPIFY_CDN + "0883/1929/5779/files/bastilla_5.png" },
    { name: "OWK Replica II Saber", url: "https://neosabers.com/products/owk-replica-ii-saber", image: SHOPIFY_CDN + "0883/1929/5779/files/OWK_replica_II_4.png" },
  ],
  "picassotiles.com": [
    { name: "Classic Starter Set (100 Pieces)", url: "https://picassotiles.com/products/picassotiles-100-piece-set-magnet-building-blocks-pt100", image: SHOPIFY_CDN + "0316/6489/8092/files/PT100-01_V2_df2421c4-d8fe-44df-b5f5-79d6850e053c.jpg" },
    { name: "Magnetic Marble Run Race Track Set (108 Pieces)", url: "https://picassotiles.com/products/picassotiles-108pc-2-in-1-magnetic-marble-run-set-racing-track-set-ptg108", image: SHOPIFY_CDN + "0316/6489/8092/files/PTG108-01_7.jpg" },
    { name: "Magnetic Tile Race Track Set (150 Pieces)", url: "https://picassotiles.com/products/picassotiles-150pc-race-track-building-blocks-ptr150", image: SHOPIFY_CDN + "0316/6489/8092/files/PTR150-01V2.jpg" },
  ],
  "mixsoon.us": [
    { name: "Bean Cream 50ml", url: "https://mixsoon.us/products/mixsoon-bean-cream-50ml", image: SHOPIFY_CDN + "0797/3299/8445/files/Bean_Cream_50ml.png" },
    { name: "Bean Essence 50ml", url: "https://mixsoon.us/products/mixsoon-bean-essence-50ml", image: SHOPIFY_CDN + "0797/3299/8445/files/Bean_Essence_50ml.png" },
    { name: "Bean Sunscreen 50ml", url: "https://mixsoon.us/products/mixsoon-bean-sunscreen-50ml", image: SHOPIFY_CDN + "0797/3299/8445/files/2560__1.jpg" },
  ],
  "topdon.com": [
    { name: "TopScan Bluetooth Scanner", url: "https://eu.topdon.com/products/topscan", image: SHOPIFY_CDN + "0555/3753/3209/files/TopScan_Pro-0.jpg" },
    { name: "CarPal Wireless Scanner", url: "https://eu.topdon.com/products/carpal", image: SHOPIFY_CDN + "0555/3753/3209/files/CarPal-1.jpg" },
    { name: "ArtiDiag600 S Scan Tool", url: "https://eu.topdon.com/products/artidiag600-s", image: SHOPIFY_CDN + "0555/3753/3209/files/AD600-S-7.jpg" },
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
 * Categories, in the order they're shown. Stores listed in STORE_INFO below always go to the
 * category given there. Any other store whose "Ngành hàng" cell in the sheet is empty or "Tự động"
 * is sorted automatically: its name, description, products and Shopify shop description are matched
 * against each category's `words` (plurals count too), and the most matches win. A store with no
 * matches goes to the last category. `aliases` are old slugs that still open the category.
 */
const CATEGORIES = [
  {
    slug: "skincare-beauty",
    name: "Skincare & beauty",
    intro: "Face masks, tanning, nails, hair care and makeup tools from independent beauty brands.",
    words: ["skin", "skincare", "face", "facial", "mask", "serum", "patch", "wrinkle", "beauty", "cosmetic",
      "makeup", "lipstick", "moisturizer", "moisturiser", "acne", "sunscreen", "spf", "nail", "fragrance", "perfume",
      "hair", "haircare", "shampoo", "conditioner", "tan", "tanning", "keratin", "essence", "toner"],
  },
  {
    slug: "vitamins-supplements",
    name: "Supplements & wellness",
    intro: "Multivitamins, gummies, prenatal packs, electrolytes and other everyday wellness brands.",
    words: ["vitamin", "multivitamin", "supplement", "gummy", "gummies", "capsule", "probiotic", "prebiotic", "magnesium",
      "omega", "nutrition", "nutrient", "mineral", "prenatal", "longevity", "nootropic", "protein", "electrolyte", "creatine",
      "collagen", "nutraceutical", "wellness"],
  },
  {
    slug: "food-drink",
    aliases: ["herbal-teas"],
    name: "Food & drink",
    intro: "Herbal teas, honey and other food and drink sold direct by the brand.",
    words: ["tea", "herbal", "herb", "matcha", "infusion", "essiac", "chai", "tisane", "kombucha", "honey", "manuka",
      "coffee", "snack", "chocolate", "food", "drink", "beverage"],
  },
  {
    slug: "clothing-accessories",
    name: "Clothing & accessories",
    intro: "Streetwear, menswear, lingerie, grip socks, bags and jewelry.",
    words: ["sock", "apparel", "clothing", "shirt", "dress", "legging", "activewear", "sportswear", "jewelry", "jewellery",
      "handbag", "backpack", "duffel", "duffle", "luggage", "suitcase", "shoe", "sneaker", "hoodie", "swimwear", "underwear",
      "bra", "lingerie", "menswear", "womenswear", "streetwear", "fashion", "bracelet", "necklace", "ring"],
  },
  {
    slug: "home-garden",
    name: "Home & garden",
    intro: "Juicers, water filters, lighting, power tools and other gear for the home and yard.",
    words: ["homeware", "kitchen", "cookware", "bedding", "pillow", "mattress", "furniture", "decor", "candle", "garden",
      "plant", "juicer", "blender", "filter", "filtration", "lamp", "lighting", "tool", "drill", "lawn", "alarm"],
  },
  {
    slug: "electronics",
    name: "Electronics",
    intro: "Keyboards, mice, audio, chargers, cameras, smart-home and car tech, plus laptop bags and cases.",
    words: ["electronic", "charger", "headphone", "earbud", "speaker", "laptop", "gadget", "camera", "smartwatch",
      "keyboard", "keycap", "mouse", "mice", "gaming", "controller", "console", "amplifier", "audio", "hifi", "radio",
      "projector", "tablet", "monitor", "smart", "carplay", "tripod", "power station", "solar", "usb"],
  },
  {
    slug: "toys-kids",
    name: "Toys & kids",
    intro: "Plushies, squishies, building tiles, RC cars, lightsabers and baby gear.",
    words: ["toy", "plush", "plushie", "squishy", "kid", "kids", "baby", "toddler", "stem", "lego", "rc", "lightsaber",
      "kawaii", "puzzle", "doll"],
  },
  {
    slug: "sports-outdoors",
    name: "Sports & outdoors",
    intro: "Fitness gear, boat parts, e-bike batteries and road-trip guides.",
    words: ["fitness", "gym", "workout", "calisthenics", "yoga", "pilates", "boat", "marine", "outboard", "bike", "ebike",
      "cycling", "camping", "hiking", "fishing", "golf", "outdoor", "tour"],
  },
  {
    slug: "more-deals",
    name: "More deals",
    intro: "Codes from stores that don't fit the other categories.",
    words: [],
  },
];

/*
 * How each store shows on the site, by its slug (the part after store.html?s=). Shopify's own shop
 * name and description are often written for the brand's home page ("Our formulas…", "Official
 * Store"), so each store gets a clean name, a short neutral description and a fixed category here.
 * The sheet's own "Tên cửa hàng" and "Mô tả ngắn" cells still win when anh fills them. `logo` is
 * optional: a clear logo for a store whose site icon is tiny (the sheet's "Link logo" cell still wins).
 * Add a line here for every new store: no health claims, only what the store sells.
 */
const STORE_INFO = {
  "tolevita": { name: "Tolevita", category: "skincare-beauty", about: "Bio-collagen face masks, hydrogel eye patches and wellness patches. Free shipping on US orders over $20." },
  "genuine-essiac": { name: "Genuine Essiac", category: "food-drink", about: "The eight-herb Essiac tea blend from Rene Caisse's formula, sold loose in 1 oz to 1 lb packs." },
  "maryruthorganics": { name: "MaryRuth's", category: "vitamins-supplements", about: "Liquid multivitamins, gummies and other vegan, non-GMO vitamins for adults and kids." },
  "heights": { name: "Heights", category: "vitamins-supplements", about: "A UK supplement brand selling Vitals⁺, Biotic⁺, Magnesium⁺ and Thrive⁺, one-off or on subscription." },
  "birdandbe": { name: "Bird&Be", category: "vitamins-supplements", about: "Prenatal vitamin packs and at-home tests for women and men, sold one-off or by subscription." },
  "elliosa": { name: "Elliosa", category: "clothing-accessories", about: "Grip socks for Pilates, barre and yoga in bright, playful designs." },
  "avea-life": { name: "AVEA", category: "vitamins-supplements", about: "A Swiss longevity supplement brand: Collagen Activator, Sereniser, Stabiliser and more." },
  "mizulabdrinks": { name: "Mizu Lab", category: "vitamins-supplements", about: "Zero-sugar, Asian-inspired electrolyte drink mixes in flavors like Japanese soda and white peach." },
  "enhancedlabs": { name: "Enhanced Labs", category: "vitamins-supplements", about: "Sports and fitness supplements." },
  "wavwatch": { name: "WAVwatch", category: "vitamins-supplements", about: "A wearable that plays sound frequencies through the skin, sold as the WAVwatch 2.2." },
  "bodybio": { name: "BodyBio", category: "vitamins-supplements", about: "Supplements built around phospholipids, like BodyBio PC, plus butyrate and the e-lyte electrolyte concentrate." },
  "jennibag": { name: "JenniBag", category: "clothing-accessories", about: "Rolling duffel bags that work as carry-on luggage, from the Classic to the Roller." },
  "korekawaii": { name: "Kore Kawaii", category: "toys-kids", about: "Kawaii plushies, keychains, hoodies and decor, with free worldwide shipping." },
  "niepceinc": { name: "Niepce", category: "clothing-accessories", about: "Techwear and streetwear: joggers, cargo pants, jackets and crossbody bags." },
  "lussotan": { name: "Lusso Tan", category: "skincare-beauty", about: "Self-tanning mousses, gradual tanners and tanning mitts." },
  "protoarc": { name: "ProtoArc", category: "electronics", about: "Ergonomic split keyboards, vertical mice, trackballs and office chairs." },
  "ohora": { name: "ohora", category: "skincare-beauty", about: "Semi-cured gel nail strips and starter kits for salon-style nails at home." },
  "galyna": { name: "GALYNA", category: "skincare-beauty", about: "Skincare creams and balms, many made with CBD." },
  "legendairymilk": { name: "Legendairy Milk", category: "vitamins-supplements", about: "Organic herbal supplements made for breastfeeding mothers." },
  "tabasquishy": { name: "TABASQUISHY", category: "toys-kids", about: "Soft squishy toys, blind bags and collectible squishies." },
  "fosiaudio": { name: "Fosi Audio", category: "electronics", about: "Compact hi-fi amplifiers, DACs, headphone amps and CD players." },
  "webbernaturals": { name: "Webber Naturals", category: "vitamins-supplements", about: "Canadian vitamins, minerals and omega-3s, priced in Canadian dollars, with free shipping over C$25." },
  "womierkeyboard": { name: "Womier", category: "electronics", about: "Mechanical and Hall effect keyboards, keycaps and accessories for gaming and work." },
  "slimq": { name: "SlimQ", category: "electronics", about: "GaN USB-C chargers and gaming laptop chargers up to 330W." },
  "jessupbeauty": { name: "Jessup Beauty", category: "skincare-beauty", about: "Makeup brush sets, sponges, brush cleaners and cosmetic bags." },
  "jlmmarine": { name: "JLM Marine", category: "sports-outdoors", about: "Aftermarket outboard engine parts and boating supplies, sold direct by the maker." },
  "meross": { name: "Meross", category: "electronics", about: "Smart garage door openers, plugs, sensors and other smart-home devices that work with Apple Home, Alexa and Google." },
  "mellif-tools": { name: "Mellif", category: "home-garden", about: "Cordless power tools, pumps and outdoor equipment for DIY and yard work." },
  "atk": { name: "ATK Gear", category: "electronics", about: "Lightweight gaming mice and magnetic-switch keyboards." },
  "tomtoc": { name: "tomtoc", category: "electronics", about: "Laptop sleeves, briefcases, backpacks and cases for laptops, tablets and game consoles." },
  "homezada": { name: "HomeZada", category: "home-garden", about: "A home management app for keeping track of your home inventory, upkeep and projects." },
  "quntis": { name: "Quntis", category: "home-garden", about: "Monitor light bars, desk lamps, solar lights and fairy lights." },
  "amandean": { name: "Amandean", category: "vitamins-supplements", about: "Marine collagen, collagen peptides, gelatin and other supplement powders." },
  "tidradio": { name: "TIDRADIO", category: "electronics", about: "Ham, GMRS and two-way radios, plus antennas and accessories." },
  "palmpals": { name: "Palm Pals", category: "toys-kids", about: "Small, palm-sized plush toys in collectible characters." },
  "grecell": { name: "GRECELL", category: "electronics", about: "Portable power stations and solar panels for camping and power cuts." },
  "barriorzz": { name: "BARRIORZZ", category: "sports-outdoors", about: "Calisthenics and strength gear: dip belts, gymnastic rings, parallettes and wrist wraps." },
  "picassotiles": { name: "PicassoTiles", category: "toys-kids", logo: "https://www.picassotiles.com/cdn/shop/files/PicassoTiles_Circle_Logo__Stacked_Colored_WHTBG.png?v=1669403570&width=400", about: "Magnetic building tiles and STEM toy sets for kids." },
  "parfaitlingerie": { name: "Parfait", category: "clothing-accessories", logo: "https://parfaitlingerie.com/cdn/shop/files/ParfaitBLKlogo_600x.png?v=1738542576", about: "Plus-size lingerie, from 32A to 44G in select styles." },
  "topdon": { name: "TOPDON", category: "electronics", logo: "https://eu.topdon.com/cdn/shop/files/TOPDON_512-512.jpg?v=1679465687", about: "Car diagnostic scanners, battery testers, jump starters and thermal cameras. European store, prices in euros." },
  "telesinstore": { name: "Telesin", category: "electronics", about: "Action camera and phone camera gear: mounts, underwater housings, selfie sticks and lights." },
  "babyquip": { name: "BabyQuip", category: "toys-kids", logo: "https://d28w2s5u3j4b6n.cloudfront.net/img/BQ_PrimaryCentered_RGB.jpg", about: "Rent baby gear like cribs, car seats and strollers when you travel, delivered and set up for you." },
  "carlinkit": { name: "Carlinkit", category: "electronics", about: "Wireless CarPlay and Android Auto adapters." },
  "mixsoon": { name: "mixsoon", category: "skincare-beauty", logo: "https://mixsoon.us/cdn/shop/files/2c033f04efc2ffb54d04b8b15ceceb30.png?v=1755158966&width=400", about: "Korean skincare essences, creams, sunscreens and cleansers, shipped from the US." },
  "ulanzi": { name: "Ulanzi", category: "electronics", about: "Camera tripods, cages, mounts, lights and other gear for creators." },
  "carpuride": { name: "Carpuride", category: "electronics", about: "Portable wireless CarPlay and Android Auto screens for cars and motorcycles." },
  "clocky": { name: "Clocky", category: "home-garden", about: "The alarm clock on wheels that rolls off the nightstand when you hit snooze." },
  "ivankyo": { name: "VANKYO", category: "electronics", about: "Mini and portable projectors, plus tablets." },
  "evilhair": { name: "Evilhair", category: "skincare-beauty", logo: "https://evilhair.com/cdn/shop/t/40/assets/logo.png?v=30331125676332007051740436577", about: "Pastel and vivid color-depositing hair conditioners." },
  "redcatracing": { name: "Redcat Racing", category: "toys-kids", about: "Ready-to-run RC cars, trucks and crawlers, plus parts." },
  "yosepower": { name: "Yose Power", category: "sports-outdoors", about: "Electric bike batteries and e-bike conversion kits." },
  "omegajuicers": { name: "Omega Juicers", category: "home-garden", logo: "https://omegajuicers.com/cdn/shop/files/omega-logo.jpg?v=1727974878", about: "Slow masticating juicers, blenders and other kitchen appliances." },
  "elevatedfaith": { name: "Elevated Faith", category: "clothing-accessories", about: "Christian jewelry and apparel: bracelets, rings, hoodies and tees." },
  "chicchoi": { name: "ChicChoi", category: "clothing-accessories", about: "Cute backpacks, pencil cases, planners and journals." },
  "cleannutra": { name: "Clean Nutraceuticals", category: "vitamins-supplements", about: "US-made supplements sold direct by the brand." },
  "shakaguide": { name: "Shaka Guide", category: "sports-outdoors", about: "GPS audio tour apps for road trips, from Hawaii to US national parks." },
  "crystalquest": { name: "Crystal Quest", category: "home-garden", logo: "https://crystalquest.com/cdn/shop/files/CQLogo.png?v=1738491527&width=480", about: "Water filters for the whole house, under the sink, the countertop and the shower." },
  "playvital": { name: "PlayVital", category: "electronics", logo: "https://www.playvital.com/cdn/shop/files/banner.png?v=1658218504&width=400", about: "Skins, grips, thumb caps and other accessories for game controllers and consoles." },
  "burbur": { name: "BUR BUR", category: "skincare-beauty", about: "Plant-based botanical hair oils." },
  "owowbeauty-uk": { name: "ANSWR", category: "skincare-beauty", about: "At-home keratin hair treatments and skincare. UK store." },
  "newzealandhoneyco": { name: "New Zealand Honey Co.", category: "food-drink", about: "Raw, UMF-certified Manuka honey from New Zealand, with free US shipping over $30." },
  "epomaker": { name: "EPOMAKER", category: "electronics", logo: "https://epomaker.com/cdn/shop/files/epomaker-favicon.png?v=1646776453", about: "Mechanical keyboards, gaming mice and audio gear." },
  "parijanofficial": { name: "PARIJAN", category: "clothing-accessories", about: "Classic menswear in an \"old money\" style, without the luxury markup." },
  "neosabers": { name: "NEO Sabers", category: "toys-kids", about: "Neopixel lightsabers and blades with sound effects." },
};

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
    category: "food-drink",
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
