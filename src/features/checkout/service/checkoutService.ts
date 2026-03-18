import { apiClient } from "@/core/api/apiClient";
import {
  ORDERS_ENDPOINT,
  ADDRESS_CONFIG_ENDPOINT,
  SHIPPING_COUNTRIES_ENDPOINT,
} from "@/core/api/endpoints";
import type {
  CheckoutFormData,
  OrderResponse,
  CountryAddressConfig,
} from "../model/types";
import type { CartItem } from "@/features/cart/model/types";

/**
 * Submit the order.
 */
export async function submitOrder(payload: {
  items: CartItem[];
  checkout: CheckoutFormData;
}): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>(ORDERS_ENDPOINT, payload);
  return data;
}

/**
 * Fetch dynamic address fields for a given country.
 */
export async function fetchAddressConfig(
  countryCode: string
): Promise<CountryAddressConfig> {
  const { data } = await apiClient.get<CountryAddressConfig>(
    `${ADDRESS_CONFIG_ENDPOINT}/${countryCode}`
  );
  return data;
}

/**
 * Fetch available countries for shipping.
 */
export async function fetchShippingCountries(): Promise<
  { code: string; name: string }[]
> {
  const { data } = await apiClient.get<{ code: string; name: string }[]>(
    SHIPPING_COUNTRIES_ENDPOINT
  );
  return data;
}
