/*
 * Blog posts, newest first. Each post is its own page (url); this list feeds the Blog page,
 * "From the blog" on the home page and "Read before you buy" on the store's page.
 *   category - slug of one of POST_CATEGORIES
 *   store    - slug of the store the post is about (optional)
 *   image    - cover photo used on cards and at the top of the post
 *   focus    - optional CSS object-position keeping the subject of the photo in frame on cards
 *   date     - "YYYY-MM-DD"
 */

const POST_CATEGORIES = [
  { slug: "brand-guides", name: "Brand guides" },
  { slug: "coupon-guides", name: "Coupon guides" },
];

const POSTS = [
  {
    slug: "heights-discount-code",
    url: "blog-heights-discount-code.html",
    title: "Heights Discount Code: How to Save 25% on Vitals⁺, Biotic⁺ and Bundles",
    excerpt:
      "Use code CHANTELLEPANG for 25% off at Heights. How to apply it in under a minute, which buys stretch it furthest, and what to check before you pay.",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/magnesium-biotic-vitals-bundle-new.png?v=1746177540",
    imageAlt: "Heights Vitals⁺, Biotic⁺ and Magnesium⁺ jars side by side",
    focus: "center 30%",
    category: "coupon-guides",
    store: "heights",
    date: "2026-10-30",
    minutes: 5,
  },
  {
    slug: "heights-supplements-guide",
    url: "blog-heights-supplements-guide.html",
    title: "Heights Supplements Explained: Which One Fits Your Routine?",
    excerpt:
      "Vitals⁺, Biotic⁺, Magnesium⁺, Thrive⁺ or Hydrate⁺? What's inside each Heights supplement, who it suits and how to take it, plus the code that takes 25% off.",
    image: "https://cdn.shopify.com/s/files/1/0092/3834/7861/files/Frame15916.jpg?v=1746177540",
    imageAlt: "An open hand holding Heights capsules against a blue sky",
    focus: "center 78%",
    category: "brand-guides",
    store: "heights",
    date: "2026-10-30",
    minutes: 7,
  },
];
