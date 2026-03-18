import { v4 as uuidv4 } from "uuid";

/**
 * Commerce-Cart-Token management.
 *
 * The Envie backend identifies anonymous carts via a token sent
 * in the Commerce-Cart-Token header. The FRONTEND generates this
 * token (UUID v4) on first visit and stores it in a cookie.
 *
 * Same pattern as the Vite projects (CookieHelper.ensureCartToken).
 */

const CART_TOKEN_KEY = "cartToken";
const CART_TOKEN_MAX_AGE_DAYS = 500;

const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Get the cart token, creating one if it doesn't exist.
 * Always returns a token (generates UUID on first call).
 */
export const getCartToken = (): string | null => {
  if (typeof document === "undefined") return null;

  let token = getCookie(CART_TOKEN_KEY);
  if (!token) {
    token = uuidv4();
    setCookie(CART_TOKEN_KEY, token, CART_TOKEN_MAX_AGE_DAYS);
  }
  return token;
};

/**
 * Clear the cart token (e.g., after order completion).
 */
export const clearCartToken = (): void => {
  if (typeof document === "undefined") return;
  setCookie(CART_TOKEN_KEY, "", -1);
};
