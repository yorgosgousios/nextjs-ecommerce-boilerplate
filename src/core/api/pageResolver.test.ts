import { describe, it, expect } from "vitest";
import { getPageDataByType } from "@/core/api/pageResolver";
import type { RouteResolution } from "@/core/api/routerModel";

import { fetchProductListingByCategory } from "@/features/product-listing/service/productListingService";
import {
  fetchBlogPost,
  fetchBlogListing,
} from "@/features/blog/service/blogService";
import { fetchBasicPage } from "@/features/basic-page/service/basicPageService";
import { fetchLandingPage } from "@/features/landing/service/landingService";
import { fetchProductById } from "@/features/product/services/productSerivce";

const makeRoute = (overrides: Partial<RouteResolution>): RouteResolution => ({
  type: "node",
  bundle: "page",
  id: 1,
  path: "/test",
  ...overrides,
});

describe("getPageDataByType", () => {
  // ── Products ─────────────────────────────────────────

  it("maps commerce_product to fetchProductById", () => {
    const result = getPageDataByType(
      makeRoute({ type: "commerce_product", bundle: "product" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("product");
    expect(result!.apiGetPageData).toBe(fetchProductById);
  });

  // ── Taxonomy terms ───────────────────────────────────

  it("maps taxonomy_term with menu_category to product listing", () => {
    const result = getPageDataByType(
      makeRoute({ type: "taxonomy_term", bundle: "menu_category" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("product_listing");
    expect(result!.apiGetPageData).toBe(fetchProductListingByCategory);
  });

  it("maps taxonomy_term with blog_categories to blog listing", () => {
    const result = getPageDataByType(
      makeRoute({ type: "taxonomy_term", bundle: "blog_categories" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("blog_listing");
    expect(result!.apiGetPageData).toBe(fetchBlogListing);
  });

  it("maps unknown taxonomy_term bundle to product listing (default)", () => {
    const result = getPageDataByType(
      makeRoute({ type: "taxonomy_term", bundle: "some_unknown_bundle" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("product_listing");
  });

  // ── Nodes ────────────────────────────────────────────

  it("maps node with landing_page bundle", () => {
    const result = getPageDataByType(
      makeRoute({ type: "node", bundle: "landing_page" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("landing_page");
    expect(result!.apiGetPageData).toBe(fetchLandingPage);
  });

  it("maps node with blog bundle", () => {
    const result = getPageDataByType(
      makeRoute({ type: "node", bundle: "blog" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("blog");
    expect(result!.apiGetPageData).toBe(fetchBlogPost);
  });

  it("maps node with article bundle (same as blog)", () => {
    const result = getPageDataByType(
      makeRoute({ type: "node", bundle: "article" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("blog");
    expect(result!.apiGetPageData).toBe(fetchBlogPost);
  });

  it("maps node with page bundle to basic page", () => {
    const result = getPageDataByType(
      makeRoute({ type: "node", bundle: "page" }),
    );
    expect(result).not.toBeNull();
    expect(result!.pageType).toBe("basic_page");
    expect(result!.apiGetPageData).toBe(fetchBasicPage);
  });

  // ── Unknown types → null (404) ───────────────────────

  it("returns null for unknown entity type", () => {
    const result = getPageDataByType(makeRoute({ type: "unknown_entity" }));
    expect(result).toBeNull();
  });

  it("returns null for unknown node bundle", () => {
    const result = getPageDataByType(
      makeRoute({ type: "node", bundle: "some_unknown_bundle" }),
    );
    expect(result).toBeNull();
  });
});
