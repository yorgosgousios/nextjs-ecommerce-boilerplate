import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { OAUTH_TOKEN_ENDPOINT } from "./endpoints";

/**
 * Shared API client.
 *
 * Public API calls (products, categories, route resolution) work WITHOUT auth.
 * Auth token is only attached when a user has logged in (stored in cookie).
 *
 * Works on both server (getServerSideProps) and client (viewmodel hooks).
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.example.com";
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET ?? "";
const TOKEN_COOKIE_NAME = "access_token";

// ── Axios instance ───────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────
// Attach auth token if available (user is logged in). Skip otherwise.

apiClient.interceptors.request.use((config) => {
  // Client-side: check cookie for logged-in user token
  if (typeof window !== "undefined") {
    const token = getCookie(TOKEN_COOKIE_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Server-side: token can be injected per-request via config.headers
  // (e.g., from getServerSideProps reading the cookie from ctx.req)

  return config;
});

// ── Response interceptor ─────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // On 401: clear token cookie, redirect to login (client-side only)
    if (status === 401 && typeof window !== "undefined") {
      removeCookie(TOKEN_COOKIE_NAME);
      // Don't redirect for public pages — only if user was logged in
      const hadToken = getCookie(TOKEN_COOKIE_NAME);
      if (hadToken) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ── User login flow ──────────────────────────────────────

/**
 * Login with username + password.
 * Call this from a login form — stores the token in a cookie.
 */
export async function loginUser(
  username: string,
  password: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const formData = new FormData();
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);
  formData.append("client_id", CLIENT_ID);
  formData.append("client_secret", CLIENT_SECRET);

  const { data } = await axios.post(
    `${BASE_URL}${OAUTH_TOKEN_ENDPOINT}`,
    formData
  );

  // Store token in cookie
  const expiresInDays = data.expires_in / 86400; // convert seconds to days
  setCookie(TOKEN_COOKIE_NAME, data.access_token, expiresInDays);

  if (data.refresh_token) {
    setCookie("refresh_token", data.refresh_token, expiresInDays);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Logout — clear tokens.
 */
export function logoutUser(): void {
  removeCookie(TOKEN_COOKIE_NAME);
  removeCookie("refresh_token");
}

/**
 * Check if a user is currently logged in (has a token cookie).
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!getCookie(TOKEN_COOKIE_NAME);
}

// ── Cookie helpers ───────────────────────────────────────

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function removeCookie(name: string): void {
  setCookie(name, "", -1);
}
