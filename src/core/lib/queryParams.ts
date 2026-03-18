import { NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

/**
 * Parse a query param that should be a number.
 * Returns the fallback if the param is missing or invalid.
 */
export function parseNumberParam(
  query: ParsedUrlQuery,
  key: string,
  fallback: number
): number {
  const raw = query[key];
  if (typeof raw !== "string") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parse a query param that should be a string.
 */
export function parseStringParam(
  query: ParsedUrlQuery,
  key: string,
  fallback = ""
): string {
  const raw = query[key];
  return typeof raw === "string" ? raw : fallback;
}

/**
 * Parse a query param that should be a string array (comma-separated).
 */
export function parseArrayParam(
  query: ParsedUrlQuery,
  key: string
): string[] {
  const raw = query[key];
  if (typeof raw === "string") return raw.split(",").filter(Boolean);
  if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
  return [];
}

/**
 * Push updated filters to the URL without triggering a full page reload.
 * Only includes params with non-default values to keep URLs clean.
 */
export function pushFiltersToUrl(
  router: NextRouter,
  params: Record<string, string | number | string[] | undefined>
) {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;

    query[key] = Array.isArray(value) ? value.join(",") : String(value);
  }

  router.push({ pathname: router.pathname, query }, undefined, {
    shallow: true,
  });
}
