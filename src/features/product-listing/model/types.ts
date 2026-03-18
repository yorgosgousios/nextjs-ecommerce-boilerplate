// ─────────────────────────────────────────────────────────
// Product Listing API Response
// GET /api/v1/taxonomy/{tid}
// ─────────────────────────────────────────────────────────

import { Breadcrumb, MetaTags, ProductImage, ProductSize } from "@/core/types";

/** Top-level response from /api/v1/taxonomy/{tid} */
export interface TaxonomyResponse {
  info: TaxonomyInfo;
  data: ProductListingItem[];
  facets: Facet[];
  pager: Pager;
  breadcrumbs: Breadcrumb[];
  sort: SortConfig;
  hasMarketingPost: boolean;
  facet_extra_rendering: string | null;
  facet_extra_rendering_body: string | null;
}

// ── Category Info ────────────────────────────────────────

export interface TaxonomyInfo {
  name: string;
  description: string | null;
  image: string | null;
  additional_information: string | null;
  term_links: TermLink[];
  metaTags: MetaTags;
}

export interface TermLink {
  title: string;
  cleanUrl: string;
}

// ── Product Listing Item ─────────────────────────────────

export interface ProductListingItem {
  listing_weight: string;
  product_id: number;
  title: string;
  cleanUrl: string;
  mastersku: string;
  default_variation_id: number;
  availability: string;
  tag_label: string | null;
  tag_on_image: string[];
  category: string;
  marketing_category: string[];
  brand: string;
  color_name: string;
  is_leather: boolean;
  list_price_raw: number | null;
  list_price: string | null;
  price_raw: number;
  price: string;
  discount_percentage: string | null;
  sizes: ProductSize[];
  image: ProductImage[];
  image_hover: ProductImage[];
  ga4_category: string[];
}

// ── Facets (Filters) ─────────────────────────────────────

export interface Facet {
  facet: string;
  name: string;
  filters: FacetFilter[];
  extra_rendering: boolean;
}

export interface FacetFilter {
  count: string;
  filter: string;
  filter_transliterated: string;
  weight?: string | number;
}

// ── Pagination ───────────────────────────────────────────

export interface Pager {
  numberOfElements: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

// ── Sort ─────────────────────────────────────────────────

export interface SortConfig {
  selected: string;
  options: SortOption[];
}

export interface SortOption {
  value: string;
  label: string;
}
