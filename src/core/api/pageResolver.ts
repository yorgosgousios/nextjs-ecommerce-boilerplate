/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouteResolution } from "@/core/api/routerModel";

import { fetchProductListingByCategory } from "@/features/product-listing/service/productListingService";
import {
  fetchBlogPost,
  fetchBlogListing,
} from "@/features/blog/service/blogService";
import { fetchBasicPage } from "@/features/basic-page/service/basicPageService";
import { fetchLandingPage } from "@/features/landing/service/landingService";
import { fetchProductById } from "@/features/product/services/productSerivce";

export interface PageDataEntry {
  apiGetPageData: (id: number, page: number) => Promise<any>;
  pageType: string;
}

/**
 * Given the route data from the backend, return the correct service function
 * and the pageType string used for rendering.
 *
 * This is the core routing logic — the backend tells us "this path is a
 * commerce_product with bundle product", and we return { fetchProductById, "product" }.
 */
export const getPageDataByType = (
  routeData: RouteResolution,
): PageDataEntry | null => {
  switch (routeData.type) {
    case "commerce_product":
      return { apiGetPageData: fetchProductById, pageType: "product" };

    case "taxonomy_term":
      switch (routeData.bundle) {
        case "blog_categories":
          return { apiGetPageData: fetchBlogListing, pageType: "blog_listing" };
        default:
          return {
            apiGetPageData: fetchProductListingByCategory,
            pageType: "product_listing",
          };
      }

    case "node":
      switch (routeData.bundle) {
        case "landing_page":
          return { apiGetPageData: fetchLandingPage, pageType: "landing_page" };
        case "blog":
        case "article":
          return { apiGetPageData: fetchBlogPost, pageType: "blog" };
        case "page":
          return { apiGetPageData: fetchBasicPage, pageType: "basic_page" };
        default:
          return null;
      }

    default:
      return null;
  }
};
