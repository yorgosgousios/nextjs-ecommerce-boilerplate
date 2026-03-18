/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiClient } from "@/core/api/apiClient";
import { PRODUCTS_ENDPOINT } from "@/core/api/endpoints";
import type { ProductDetailResponse } from "../model/types";

/**
 * Fetch a single product by CMS entity ID.
 * Envie API: GET /api/v1/products/{pid}
 */
export const fetchProductById = async (
  id: number,
  page = 0,
): Promise<ProductDetailResponse | null> => {
  try {
    const { data } = await apiClient.get<ProductDetailResponse>(
      `${PRODUCTS_ENDPOINT}/${id}`,
    );
    return data;
  } catch {
    return null;
  }
};
