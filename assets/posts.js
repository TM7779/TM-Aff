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
