/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./apiClient";
import { ROUTER_ENDPOINT } from "./endpoints";
import type { RouteResolution } from "./routerModel";

/**
 * Send a path to the backend and get back the entity type + ID.
 *
 * Error handling:
 *  - 404 → returns null (path not found in CMS)
 *  - 410 → returns RouteResolution with status 410
 *  - 5xx / network errors → throws (triggers Next.js 500 page)
 */
export const resolveRoute = async (
  path: string,
  locale?: string,
): Promise<RouteResolution | null> => {
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

    // 404 = path not found in CMS → caller returns { notFound: true }
    if (status === 404) return null;

    // 410 = page was deleted/gone → caller renders PageGone component
    if (status === 410) {
      return {
        type: "gone",
        bundle: "gone",
        id: 0,
        path,
        status: 410,
      };
    }

    // 5xx or network errors → throw so Next.js renders 500.tsx
    console.error(
      "[resolveRoute] Server error for path:",
      path,
      status ?? "network error",
    );
    throw error;
  }
};
