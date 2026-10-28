/*
 * Minimal static server for Hostinger's Node.js hosting. No dependencies.
 *
 * Environment variables (set in hPanel):
 *   PORT          - provided by Hostinger automatically
 *   CONTACT_EMAIL - email shown on the Contact and Disclosure pages
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

// Only these folders/files are served, so server.js, package.json and .git stay private.
const PUBLIC = /^\/(assets\/[\w\-./]+|[\w\-]+\.html|robots\.txt|favicon\.ico)?$/;

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type || "text/plain; charset=utf-8" });
  res.end(body);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/env.js") {
      const env = { email: process.env.CONTACT_EMAIL || "" };
      return send(res, 200, `window.SITE_ENV = ${JSON.stringify(env)};`, TYPES[".js"]);
    }

    if (pathname === "/") pathname = "/index.html";
    if (!PUBLIC.test(pathname) || pathname.includes("..")) {
      return fs.readFile(path.join(ROOT, "index.html"), (err, html) =>
        send(res, 404, err ? "Not found" : html, TYPES[".html"])
      );
    }

    const file = path.join(ROOT, pathname);
    fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, "Not found");
      const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=3600" : "no-cache",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Site running on port ${PORT}`));
