import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

interface SeoProps {
  /** Adds BreadcrumbList structured data. */
  breadcrumbs?: { name: string; path: string }[];
  title: string;
  description?: string;
  /** Path (no origin) to canonicalise to. Defaults to the current path without query. */
  canonicalPath?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** schema.org BreadcrumbList from (name, path) pairs. */
function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function Seo({ breadcrumbs, title, description = DEFAULT_DESCRIPTION, canonicalPath, image, type = "website", noindex, jsonLd }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle =
    title === SITE_NAME ? `${SITE_NAME} | Shop Ghana's stores in one place` : /\bGUGU\b/.test(title) ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${canonicalPath ?? pathname}`;
  const desc = description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description;
  const ld = [...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []), ...(breadcrumbs?.length ? [breadcrumbLd(breadcrumbs)] : [])];
  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:locale" content="en_GH" />
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
      {ld.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item).replace(/</g, "\\u003c")}
        </script>
      ))}
    </Helmet>
  );
}
