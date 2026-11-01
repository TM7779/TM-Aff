// Writes assets/snapshot.js: the store list exactly as the site builds it from the Google Sheet
// (sheet.js run as-is, with the Shopify fill-ins). Pages draw from it at once instead of waiting
// for the sheet, then check the live sheet in the background.
//
// Run from the site folder: node tools/snapshot.mjs
// It leaves the file untouched when the sheet can't be read or nothing changed.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "assets/snapshot.js");

const storage = new Map();
const page = {
  console,
  fetch,
  AbortController,
  URL,
  setTimeout,
  clearTimeout,
  localStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) },
};
page.window = page;
vm.createContext(page);
for (const file of ["env.js", "assets/data.js", "assets/sheet.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), page, { filename: file });
}

// Without a saved copy, a failed sheet read resolves to null.
const stores = await page.loadSheetStores({ fetchSheet: true });
if (!stores || !stores.length) {
  console.error("Could not read the sheet; snapshot left as it was.");
  process.exit(1);
}

const old = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
const oldStores = (old.match(/^window\.STORE_SNAPSHOT = (.*);$/m) || [])[1];
if (oldStores && JSON.stringify(JSON.parse(oldStores).stores) === JSON.stringify(stores)) {
  console.log(`No change (${stores.length} stores).`);
  process.exit(0);
}

const body = JSON.stringify({ at: Date.now(), stores });
fs.writeFileSync(
  out,
  `// Made by tools/snapshot.mjs from the Google Sheet on ${new Date().toISOString().slice(0, 10)}.\n` +
    `// Pages draw from this at once, then check the live sheet in the background.\n` +
    `window.STORE_SNAPSHOT = ${body};\n`
);
console.log(`Wrote assets/snapshot.js (${stores.length} stores, ${Math.round(body.length / 1024)} KB).`);
