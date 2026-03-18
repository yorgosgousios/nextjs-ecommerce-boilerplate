/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./apiClient";
import { ROUTER_ENDPOINT } from "./endpoints";
import type { RouteResolution } from "./routerModel";

/**
 * Send a path to the backend and get back the entity type + ID.
 *
 * This is the CMS-driven routing pattern:
 *  1. User visits /shoes/nike-air-max
 *  2. Next.js catch-all [[...slug]].tsx calls this in getServerSideProps
 *  3. Backend responds: { type: "commerce_product", bundle: "product", id: 123 }
 *  4. We then fetch the product data and render the Product component
 *
 * Returns null if the path doesn't resolve to any entity (404).
 */
export async function resolveRoute(
  path: string,
  locale?: string,
): Promise<RouteResolution | null> {
  try {
    const { data } = await apiClient.get<RouteResolution>(ROUTER_ENDPOINT, {
      params: {
        path: path.startsWith("/") ? path : `/${path}`,
        ...(locale && { locale }),
      },
    });
    return data;
  } catch (error: any) {
    const status = error?.response?.status;

    // 404 = path not found in CMS
    if (status === 404) return null;

    // 410 = page was deleted/gone
    if (status === 410) {
      return {
        type: "gone",
        bundle: "gone",
        id: 0,
        path,
        status: 410,
      };
    }

    // Other errors — let them bubble up
    console.error("[resolveRoute] Error resolving path:", path, error);
    return null;
  }
}
