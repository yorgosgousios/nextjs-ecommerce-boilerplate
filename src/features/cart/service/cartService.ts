import { apiClient } from "@/core/api/apiClient";
import { CART_ENDPOINT } from "@/core/api/endpoints";
import type {
  CartResponse,
  AddToCartPayload,
  UpdateQuantityPayload,
} from "../model/types";
import { getCartToken } from "@/core/lib/cartToken";

/**
 * Cart token header.
 * getCartToken() auto-generates a UUID if none exists,
 * so this always returns a valid header.
 */
const cartHeaders = () => ({
  "Commerce-Cart-Token": getCartToken() ?? "",
});

/**
 * GET /api/v1/cart
 */
export const fetchCart = async (): Promise<CartResponse | null> => {
  try {
    const { data } = await apiClient.get<CartResponse>(CART_ENDPOINT, {
      headers: cartHeaders(),
    });
    return data;
  } catch {
    return null;
  }
};

/**
 * POST /api/v1/cart/add
 */
export const addToCart = async (
  items: [AddToCartPayload],
): Promise<CartResponse> => {
  const { data } = await apiClient.post<CartResponse>(
    `${CART_ENDPOINT}/add`,
    items,
    { headers: cartHeaders() },
  );
  return data;
};

/**
 * PATCH /api/v1/cart/{order_id}/items/{order_item_id}
 */
export const updateCartItemQuantity = async (
  orderId: number,
  orderItemId: number,
  payload: UpdateQuantityPayload,
): Promise<CartResponse> => {
  const { data } = await apiClient.patch<CartResponse>(
    `${CART_ENDPOINT}/${orderId}/items/${orderItemId}`,
    payload,
    { headers: cartHeaders() },
  );
  return data;
};

/**
 * DELETE /api/v1/cart/{order_id}/items/{order_item_id}
 */
export const removeCartItem = async (
  orderId: number,
  orderItemId: number,
): Promise<CartResponse> => {
  const { data } = await apiClient.delete<CartResponse>(
    `${CART_ENDPOINT}/${orderId}/items/${orderItemId}`,
    { headers: cartHeaders() },
  );
  return data;
};

/**
 * DELETE /api/v1/cart/{order_id}/items
 * Clears the entire cart. Returns 204 (no body).
 */
export const clearCart = async (orderId: number): Promise<void> => {
  await apiClient.delete(`${CART_ENDPOINT}/${orderId}/items`, {
    headers: cartHeaders(),
  });
};
