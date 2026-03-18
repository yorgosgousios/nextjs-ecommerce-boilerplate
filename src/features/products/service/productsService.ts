/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/core/api/apiClient";
import { PRODUCTS_ENDPOINT, TAXONOMY_ENDPOINT } from "@/core/api/endpoints";
import type {
  Product,
  ProductFilters,
  ProductListResponse,
} from "../model/types";

/**
 * Fetch paginated product list with filters.
 */
export async function fetchProducts(
  filters: Partial<ProductFilters> = {},
): Promise<ProductListResponse> {
  const params: Record<string, string | number> = {};

  if (filters.search) params.search = filters.search;
  if (filters.categoryIds?.length)
    params.categories = filters.categoryIds.join(",");
  if (filters.minPrice) params.min_price = filters.minPrice;
  if (filters.maxPrice) params.max_price = filters.maxPrice;
  if (filters.sortBy) params.sort = filters.sortBy;
  if (filters.page) params.page = filters.page;

  const { data } = await apiClient.get<ProductListResponse>(PRODUCTS_ENDPOINT, {
    params,
  });
  return data;
}

/**
 * Fetch a single product by CMS entity ID.
 * Envie API: GET /api/v1/products/{pid}
 */
export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const { data } = await apiClient.get<Product>(`${PRODUCTS_ENDPOINT}/${id}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch a single product by slug.
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const { data } = await apiClient.get<Product>(
      `${PRODUCTS_ENDPOINT}/${slug}`,
    );
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch product listing for a specific category by CMS taxonomy ID.
 * Envie API: GET /api/v1/taxonomy/{tid}
 */
export async function fetchProductListingByCategory(
  categoryId: number,
  page = 0,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const { data } = await apiClient.get(`${TAXONOMY_ENDPOINT}/${categoryId}`, {
    params: { page },
  });
  return data;
}

/**
 * Fetch all categories.
 */
export async function fetchCategories(): Promise<any[]> {
  const { data } = await apiClient.get<any[]>(TAXONOMY_ENDPOINT);
  return data;
}
