import { apiClient } from "@/core/api/apiClient";
import { CART_ENDPOINT, SHIPPING_METHODS_ENDPOINT } from "@/core/api/endpoints";
import type { CartItem, CartValidationResponse, ShippingMethod } from "../model/types";

/**
 * Validate cart items with the backend.
 */
export async function validateCart(
  items: CartItem[]
): Promise<CartValidationResponse> {
  const { data } = await apiClient.post<CartValidationResponse>(
    `${CART_ENDPOINT}/validate`,
    { items }
  );
  return data;
}

/**
 * Fetch available shipping methods.
 */
export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
  const { data } = await apiClient.get<ShippingMethod[]>(SHIPPING_METHODS_ENDPOINT);
  return data;
}
