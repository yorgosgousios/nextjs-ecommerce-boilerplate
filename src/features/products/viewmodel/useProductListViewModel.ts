import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useUnit } from "effector-react";
import {
  $products,
  $filters,
  $totalProducts,
  $totalPages,
  $productsLoading,
  $categories,
  filtersChanged,
  filtersReset,
  pageChanged,
  productsHydrated,
  categoriesHydrated,
} from "../store/productsStore";
import type { ProductFilters, ProductListResponse, Category } from "../model/types";
import {
  parseStringParam,
  parseNumberParam,
  parseArrayParam,
  pushFiltersToUrl,
} from "@/core/lib/queryParams";

interface UseProductListParams {
  /** SSR data passed from getServerSideProps */
  initialProducts: ProductListResponse;
  initialCategories: Category[];
}

/**
 * Products list viewmodel.
 *
 * Responsible for:
 * 1. Hydrating Effector stores from SSR props on mount
 * 2. Syncing URL query params ↔ Effector filter store (bidirectional)
 * 3. Exposing computed state and action handlers to components
 *
 * Components never touch the store directly — they use this viewmodel.
 */
export function useProductListViewModel({
  initialProducts,
  initialCategories,
}: UseProductListParams) {
  const router = useRouter();
  const isHydrated = useRef(false);

  // ── Read stores ────────────────────────────────────────
  const products = useUnit($products);
  const filters = useUnit($filters);
  const totalProducts = useUnit($totalProducts);
  const totalPages = useUnit($totalPages);
  const isLoading = useUnit($productsLoading);
  const categories = useUnit($categories);

  // ── Hydrate from SSR on first render ───────────────────
  useEffect(() => {
    if (isHydrated.current) return;
    isHydrated.current = true;

    // Populate stores with SSR data
    productsHydrated(initialProducts);
    categoriesHydrated(initialCategories);

    // Parse URL → filters (so the store reflects the current URL)
    const filtersFromUrl: Partial<ProductFilters> = {
      search: parseStringParam(router.query, "search"),
      categoryIds: parseArrayParam(router.query, "categories"),
      minPrice: parseNumberParam(router.query, "min_price", 0),
      maxPrice: parseNumberParam(router.query, "max_price", 0),
      sortBy:
        (parseStringParam(router.query, "sort") as ProductFilters["sortBy"]) ||
        "newest",
      page: parseNumberParam(router.query, "page", 1),
    };

    filtersChanged(filtersFromUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync filters → URL (on client-side filter changes) ─
  useEffect(() => {
    if (!isHydrated.current) return;

    pushFiltersToUrl(router, {
      search: filters.search,
      categories: filters.categoryIds,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      sort: filters.sortBy === "newest" ? undefined : filters.sortBy,
      page: filters.page === 1 ? undefined : filters.page,
    });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action handlers ────────────────────────────────────
  const handleSearchChange = useCallback((search: string) => {
    filtersChanged({ search });
  }, []);

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      const current = filters.categoryIds;
      const next = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId];
      filtersChanged({ categoryIds: next });
    },
    [filters.categoryIds]
  );

  const handleSortChange = useCallback(
    (sortBy: ProductFilters["sortBy"]) => {
      filtersChanged({ sortBy });
    },
    []
  );

  const handlePriceRange = useCallback(
    (minPrice: number, maxPrice: number) => {
      filtersChanged({ minPrice, maxPrice });
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    pageChanged(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleReset = useCallback(() => {
    filtersReset();
  }, []);

  // ── Return viewmodel interface ─────────────────────────
  return {
    // State
    products,
    filters,
    totalProducts,
    totalPages,
    isLoading,
    categories,

    // Computed
    hasActiveFilters:
      filters.search !== "" ||
      filters.categoryIds.length > 0 ||
      filters.minPrice > 0 ||
      filters.maxPrice > 0,

    // Actions
    onSearchChange: handleSearchChange,
    onCategoryToggle: handleCategoryToggle,
    onSortChange: handleSortChange,
    onPriceRange: handlePriceRange,
    onPageChange: handlePageChange,
    onReset: handleReset,
  };
}
