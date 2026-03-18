/**
 * Response from the backend route resolver API.
 *
 * The frontend sends a path (e.g., "/shoes/nike-air-max") and the backend
 * responds with the entity type, bundle, and ID so we know what to fetch and render.
 */
export interface RouteResolution {
  /** Entity type: "commerce_product" | "taxonomy_term" | "node" */
  type: string;
  /** Bundle/subtype: "product" | "blog_category" | "landing_page" | "article" | "page" | etc. */
  bundle: string;
  /** Entity ID in the CMS */
  id: number;
  /** The resolved path */
  path: string;
  /** HTTP status hint from backend (200, 301, 410, etc.) */
  status?: number;
  /** Redirect target if status is 301/302 */
  redirect?: string;
}

/**
 * Supported page types that the frontend can render.
 * This is the discriminator used in [[...slug]].tsx to pick the right component.
 */
export type PageType =
  | "product"
  | "product_listing"
  | "blog_listing"
  | "blog"
  | "landing_page"
  | "basic_page"
  | "gone"
  | "not_found";
