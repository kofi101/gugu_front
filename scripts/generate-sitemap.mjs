#!/usr/bin/env node
// Writes dist/sitemap.xml and dist/robots.txt after `vite build`.
//
// Reads the public catalogue (active products, categories, merchants) with the Firebase web SDK,
// so it only ever sees what Firestore rules expose to anonymous visitors. Config comes from the same
// VITE_* env files as the app (.env, .env.production, .env.production.local), or the process env.
//
//   npm run build            # builds, then runs this script
//   npm run sitemap          # re-run on an existing dist/
//   VITE_USE_EMULATORS=true npm run sitemap   # against the emulator (project demo-gugu)
//
// If Firebase is not configured or unreachable, it still writes a sitemap of the static pages and
// exits 0 so a build never fails because of it.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const mode = process.env.MODE || process.env.NODE_ENV || "production";
const env = { ...loadEnv(mode, root, "VITE_"), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))) };

const SITE_URL = (env.VITE_SITE_URL || "https://gugumarket.web.app").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.SITEMAP_TIMEOUT_MS || 30000);
const PAGE = 500;

const STATIC = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/stores", changefreq: "daily", priority: "0.8" },
  { loc: "/sell", changefreq: "monthly", priority: "0.5" },
  { loc: "/about", changefreq: "monthly", priority: "0.3" },
  { loc: "/contact", changefreq: "monthly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.2" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.2" },
];

const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

async function readCatalogue() {
  const useEmulators = env.VITE_USE_EMULATORS === "true";
  const projectId = env.VITE_FIREBASE_PROJECT_ID || (useEmulators ? "demo-gugu" : "");
  const apiKey = env.VITE_FIREBASE_API_KEY || (useEmulators ? "demo-api-key" : "");
  if (!projectId || !apiKey) throw new Error("VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_API_KEY not set");

  const { initializeApp, deleteApp } = await import("firebase/app");
  const fs = await import("firebase/firestore");
  const app = initializeApp({ apiKey, projectId, appId: env.VITE_FIREBASE_APP_ID }, "sitemap");
  const db = fs.getFirestore(app);
  if (useEmulators) {
    const port = Number((env.VITE_EMULATOR_PORTS || "").match(/firestore:(\d+)/)?.[1] || 8080);
    fs.connectFirestoreEmulator(db, env.VITE_EMULATOR_HOST || "127.0.0.1", port);
  }

  async function all(col, ...constraints) {
    const out = [];
    let cursor = null;
    for (;;) {
      const q = fs.query(fs.collection(db, col), ...constraints, fs.orderBy(fs.documentId()), ...(cursor ? [fs.startAfter(cursor)] : []), fs.limit(PAGE));
      const snap = await fs.getDocs(q);
      out.push(...snap.docs);
      if (snap.size < PAGE) break;
      cursor = snap.docs[snap.docs.length - 1];
    }
    return out;
  }

  try {
    const [products, categories, merchants] = await Promise.all([
      all("products", fs.where("isActive", "==", true)),
      all("categories"),
      all("merchants"),
    ]);
    const lastmod = (d) => {
      const t = d.get("updatedAt") ?? d.get("createdAt");
      return t && typeof t.toDate === "function" ? t.toDate().toISOString().slice(0, 10) : undefined;
    };
    return [
      ...categories.map((d) => ({ loc: `/c/${encodeURIComponent(d.id)}`, changefreq: "daily", priority: "0.8" })),
      ...merchants
        .filter((d) => d.get("isActive") !== false)
        .map((d) => ({ loc: `/store/${encodeURIComponent(d.id)}`, changefreq: "weekly", priority: "0.6", lastmod: lastmod(d) })),
      ...products.map((d) => ({ loc: `/p/${encodeURIComponent(d.id)}`, changefreq: "weekly", priority: "0.7", lastmod: lastmod(d) })),
    ];
  } finally {
    await fs.terminate(db).catch(() => {});
    await deleteApp(app).catch(() => {});
  }
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function main() {
  if (!existsSync(dist)) await mkdir(dist, { recursive: true });
  let dynamic = [];
  try {
    dynamic = await withTimeout(readCatalogue(), TIMEOUT_MS);
  } catch (err) {
    console.warn(`[sitemap] catalogue not included: ${err.message}. Writing static pages only.`);
  }

  const urls = [...STATIC, ...dynamic];
  const body = urls
    .map((u) =>
      [
        "  <url>",
        `    <loc>${xmlEscape(SITE_URL + u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
  await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );

  const robots = [
    "User-agent: *",
    "Allow: /",
    ...["/account", "/cart", "/checkout", "/app-return", "/wishlist", "/signin", "/signup", "/forgot-password", "/search"].map((p) => `Disallow: ${p}`),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  await writeFile(path.join(dist, "robots.txt"), robots);

  console.log(`[sitemap] wrote ${urls.length} URLs (${dynamic.length} from Firestore) for ${SITE_URL}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exit(0);
});
