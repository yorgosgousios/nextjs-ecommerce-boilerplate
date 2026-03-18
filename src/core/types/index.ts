/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

// ─────────────────────────────────────────────────────────
// Shared types used across product and product-listing features
// ─────────────────────────────────────────────────────────

export interface ProductImage {
  alt: string;
  url: string;
}

export interface ProductSize {
  name: string;
  sku: string;
  variation_id: string;
  available: boolean;
  availability: string;
  stock_level: number;
}

export interface Breadcrumb {
  path: string;
  name: string;
}

export interface MetaTags {
  description: string;
  title: string;
  canonical_url: string;
  image_src: string;
  "og:description": string;
  "og:title": string;
  "og:url": string;
  "og:image": string;
  "og:image_secure_url": string;
  "og:image_url": string;
  "og:site_name"?: string;
}
