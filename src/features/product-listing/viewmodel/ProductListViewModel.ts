import { useEffect, useRef, useCallback } from "react";
import { useUnit } from "effector-react";
import {
  $products,
  $facets,
  $pager,
  $sortConfig,
  $categoryInfo,
  $isLoading,
  listingHydrated,
  pageChanged,
  sortChanged,
} from "../store/productListingStore";
import type { TaxonomyResponse } from "../model/types";

interface ProductListParams {
  /** SSR data passed from getServerSideProps */
  initialData: TaxonomyResponse;
}

/**
 * Product listing viewmodel.
 *
 * Hydrates Effector stores from SSR data on mount.
 * Exposes state + action handlers to components.
 */
export const ProductListViewModel = ({ initialData }: ProductListParams) => {
  const isHydrated = useRef(false);

  const products = useUnit($products);
  const facets = useUnit($facets);
  const pager = useUnit($pager);
  const sortConfig = useUnit($sortConfig);
  const categoryInfo = useUnit($categoryInfo);
  const isLoading = useUnit($isLoading);

  // Hydrate from SSR on first render
  useEffect(() => {
    if (isHydrated.current) return;
    isHydrated.current = true;
    listingHydrated(initialData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = useCallback((page: number) => {
    pageChanged(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    sortChanged(sort);
  }, []);

  return {
    // State
    products,
    facets,
    pager,
    sortConfig,
    categoryInfo,
    isLoading,

    // Computed
    totalProducts: pager?.totalResults ?? 0,
    totalPages: pager?.totalPages ?? 0,
    currentPage: pager?.currentPage ?? 0,
    hasNextPage: pager?.hasNext ?? false,
    categoryName: categoryInfo?.name ?? "",

    // Actions
    onPageChange: handlePageChange,
    onSortChange: handleSortChange,
  };
};
