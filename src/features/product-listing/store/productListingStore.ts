import { createStore, createEvent, createEffect } from "effector";
import type {
  TaxonomyResponse,
  ProductListingItem,
  Facet,
  Pager,
  SortConfig,
} from "../model/types";
import { fetchProductListingByCategory } from "../service/productListingService";

// ── Events ───────────────────────────────────────────────
export const filtersChanged = createEvent<Record<string, string>>();
export const filtersReset = createEvent();
export const pageChanged = createEvent<number>();
export const sortChanged = createEvent<string>();
export const listingHydrated = createEvent<TaxonomyResponse>();

// ── Effects ──────────────────────────────────────────────
export const fetchListingFx = createEffect(fetchProductListingByCategory);

// ── Stores ───────────────────────────────────────────────

export const $products = createStore<ProductListingItem[]>([])
  .on(fetchListingFx.doneData, (_, response) => response.data)
  .on(listingHydrated, (_, response) => response.data);

export const $facets = createStore<Facet[]>([])
  .on(fetchListingFx.doneData, (_, response) => response.facets)
  .on(listingHydrated, (_, response) => response.facets);

export const $pager = createStore<Pager | null>(null)
  .on(fetchListingFx.doneData, (_, response) => response.pager)
  .on(listingHydrated, (_, response) => response.pager);

export const $sortConfig = createStore<SortConfig | null>(null)
  .on(fetchListingFx.doneData, (_, response) => response.sort)
  .on(listingHydrated, (_, response) => response.sort);

export const $categoryInfo = createStore<TaxonomyResponse["info"] | null>(null)
  .on(fetchListingFx.doneData, (_, response) => response.info)
  .on(listingHydrated, (_, response) => response.info);

export const $isLoading = fetchListingFx.pending;
