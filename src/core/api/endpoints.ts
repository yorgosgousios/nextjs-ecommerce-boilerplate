/**
 * All backend API endpoints in one place.
 *
 * When the backend changes an endpoint path, you only update it here.
 * Every service file imports from this file instead of defining its own constants.
 */

// ── Router ───────────────────────────────────────────────
export const ROUTER_ENDPOINT = "/api/v1/router";

// ── Catalog ──────────────────────────────────────────────
export const PRODUCTS_ENDPOINT = "/api/v1/products";
export const TAXONOMY_ENDPOINT = "/api/v1/taxonomy";
export const SEARCH_ENDPOINT = "/api/v1/search";

// ── Content ──────────────────────────────────────────────
export const HOMEPAGE_ENDPOINT = "/api/v1/homepage";
export const PAGES_ENDPOINT = "/api/v1/pages";
export const BLOG_ENDPOINT = "/api/v1/blog";
export const LANDING_ENDPOINT = "/api/v1/landing";

// ── Cart & Checkout ──────────────────────────────────────
export const CART_ENDPOINT = "/api/v1/cart";
export const ORDERS_ENDPOINT = "/api/v1/orders";
export const SHIPPING_METHODS_ENDPOINT = "/api/v1/shipping/methods";
export const SHIPPING_COUNTRIES_ENDPOINT = "/api/v1/shipping/countries";
export const ADDRESS_CONFIG_ENDPOINT = "/api/v1/address/config";

// ── Auth & User ──────────────────────────────────────────
export const OAUTH_TOKEN_ENDPOINT = "/oauth/token";
export const PROFILES_ENDPOINT = "/api/v1/profiles";

// ── Menus & Global ──────────────────────────────────────
export const MENU_ENDPOINT = "/api/v1/menu";
export const GLOBAL_SECTIONS_ENDPOINT = "/api/v1/global-sections";
