// ── Product entity ────────────────────────────────────────
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Price in cents */
  price: number;
  /** Discounted price in cents (if applicable) */
  salePrice?: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  inStock: boolean;
  attributes: ProductAttribute[];
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// ── Filter / query types ─────────────────────────────────
export interface ProductFilters {
  search: string;
  categoryIds: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: ProductSortOption;
  page: number;
}

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc";

export const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  categoryIds: [],
  minPrice: 0,
  maxPrice: 0,
  sortBy: "newest",
  page: 1,
};

// ── API response types ───────────────────────────────────
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}
