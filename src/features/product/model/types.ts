// ─────────────────────────────────────────────────────────
// Product Detail API Response
// GET /api/v1/products/{pid}
// ─────────────────────────────────────────────────────────

import type {
  ProductImage,
  ProductSize,
  Breadcrumb,
  MetaTags,
} from "@/core/types";

/** Top-level response from /api/v1/products/{pid} */
export interface ProductDetailResponse {
  listing_weight: string;
  mastersku: string;
  product_id: string;
  title: string;
  status: boolean;
  body: string;
  brand: ProductBrand;
  color_name: string;
  category: string;
  marketing_category: string[];
  is_leather: boolean;
  details: ProductSpec[];
  tag_label: string | null;
  availability: string | null;
  availability_message: string | null;
  productMedia: ProductMedia[];
  variations: ProductVariation[];
  relativeItems: RelativeItem[];
  relativeColours: RelativeColour[];
  size_guide: string;
  breadcrumbs: Breadcrumb[];
  cleanUrl: string;
  created: string;
  changed: string;
  metaTags: MetaTags;
  ga4_category: string[];
  aggregate_rating: AggregateRating | null;
  reviews: Review[] | null;
}

export interface ProductBrand {
  name: string;
  cleanUrl: string;
  logo: {
    alt: string;
    url: string;
  };
}

export interface ProductSpec {
  key: string;
  value: string;
  cleanUrl: string;
}

export interface ProductMedia {
  type: "image" | "video";
  url: string;
  alt: string;
}

export interface ProductVariation {
  name: string;
  id: number;
  sku: string;
  currency: string;
  list_price_raw: number | null;
  list_price: string | null;
  price_raw: number;
  price: string;
  discount_percentage_raw: number | null;
  discount_percentage: string | null;
  attributes: VariationAttribute[];
  stock_level: number;
  availability: string;
  availability_message: string | null;
  status: boolean;
}

export interface VariationAttribute {
  attribute_type: string;
  attribute_name: string;
}

export interface RelativeItem {
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

export interface RelativeColour {
  cleanUrl: string;
  image: ProductImage[];
  product_id: number;
  mastersku: string;
}

export interface AggregateRating {
  ratingValue: number;
  reviewCount: number;
}

export interface Review {
  author: string;
  rating: number;
  body: string;
  date: string;
}
