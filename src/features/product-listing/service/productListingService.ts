import { apiClient } from "@/core/api/apiClient";
import { TAXONOMY_ENDPOINT } from "@/core/api/endpoints";
import type { TaxonomyResponse } from "../model/types";

/**
 * Fetch product listing for a specific category by CMS taxonomy ID.
 * Envie API: GET /api/v1/taxonomy/{tid}
 */
export const fetchProductListingByCategory = async (
  categoryId: number,
  page = 0,
): Promise<TaxonomyResponse> => {
  const { data } = await apiClient.get<TaxonomyResponse>(
    `${TAXONOMY_ENDPOINT}/${categoryId}`,
    { params: { page } },
  );
  return data;
};
