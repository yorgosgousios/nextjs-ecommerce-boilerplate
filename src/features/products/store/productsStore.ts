import { createStore, createEvent, createEffect, sample } from "effector";
import type {
  Product,
  ProductFilters,
  ProductListResponse,
  Category,
  DEFAULT_FILTERS,
} from "../model/types";
import { fetchProducts, fetchCategories } from "../service/productsService";

// ── Events ───────────────────────────────────────────────
export const filtersChanged = createEvent<Partial<ProductFilters>>();
export const filtersReset = createEvent();
export const pageChanged = createEvent<number>();
export const productsHydrated = createEvent<ProductListResponse>();
export const categoriesHydrated = createEvent<Category[]>();

// ── Effects ──────────────────────────────────────────────
export const fetchProductsFx = createEffect(fetchProducts);
export const fetchCategoriesFx = createEffect(fetchCategories);

// ── Stores ───────────────────────────────────────────────

/**
 * Current filters. Starts with defaults; hydrated from URL params
 * by the viewmodel on mount.
 */
export const $filters = createStore<ProductFilters>({
  search: "",
  categoryIds: [],
  minPrice: 0,
  maxPrice: 0,
  sortBy: "newest",
  page: 1,
})
  .on(filtersChanged, (state, payload) => ({ ...state, ...payload, page: 1 }))
  .on(pageChanged, (state, page) => ({ ...state, page }))
  .reset(filtersReset);

/**
 * Product list. Initially populated via SSR props, then updated
 * client-side when filters change.
 */
export const $products = createStore<Product[]>([])
  .on(fetchProductsFx.doneData, (_, { products }) => products)
  .on(productsHydrated, (_, { products }) => products);

export const $totalProducts = createStore<number>(0)
  .on(fetchProductsFx.doneData, (_, { total }) => total)
  .on(productsHydrated, (_, { total }) => total);

export const $totalPages = createStore<number>(1)
  .on(fetchProductsFx.doneData, (_, { totalPages }) => totalPages)
  .on(productsHydrated, (_, { totalPages }) => totalPages);

export const $productsLoading = fetchProductsFx.pending;

export const $categories = createStore<Category[]>([])
  .on(fetchCategoriesFx.doneData, (_, data) => data)
  .on(categoriesHydrated, (_, data) => data);

// ── Connections ──────────────────────────────────────────

/**
 * When filters change on the client side (after initial SSR), refetch.
 * This sample wiring is the "reactive glue" of the MVVM pattern.
 */
sample({
  clock: [filtersChanged, pageChanged],
  source: $filters,
  target: fetchProductsFx,
});
