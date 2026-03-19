import { createStore, createEvent, createEffect, sample } from "effector";
import type { CartResponse, AddToCartPayload } from "../model/types";
import {
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../service/cartService";

// ── Effects ──────────────────────────────────────────────

export const fetchCartFx = createEffect(fetchCart);

export const addToCartFx = createEffect<AddToCartPayload, CartResponse>(
  async (payload) => addToCart([payload]),
);

export const updateQuantityFx = createEffect(
  async (params: { orderId: number; orderItemId: number; quantity: number }) =>
    updateCartItemQuantity(params.orderId, params.orderItemId, {
      quantity: params.quantity,
    }),
);

export const removeItemFx = createEffect(
  async (params: { orderId: number; orderItemId: number }) =>
    removeCartItem(params.orderId, params.orderItemId),
);

export const clearCartFx = createEffect(async (orderId: number) =>
  clearCart(orderId),
);

// ── Events ───────────────────────────────────────────────

/** Trigger a cart refetch */
export const cartRefetchRequested = createEvent();

// ── Stores ───────────────────────────────────────────────

/**
 * The full cart response from the backend.
 * Every mutation (add, update, remove) returns the full updated cart,
 * so we always replace the entire state — no partial merging needed.
 */
export const $cart = createStore<CartResponse | null>(null)
  .on(fetchCartFx.doneData, (_, cart) => cart)
  .on(addToCartFx.doneData, (_, cart) => cart)
  .on(updateQuantityFx.doneData, (_, cart) => cart)
  .on(removeItemFx.doneData, (_, cart) => cart)
  .on(clearCartFx.doneData, () => null);

export const $cartIsLoading = createStore(false)
  .on(fetchCartFx, () => true)
  .on(fetchCartFx.doneData, () => false)
  .on(fetchCartFx.failData, () => false);

export const $cartIsMutating = createStore(false)
  .on(addToCartFx, () => true)
  .on(updateQuantityFx, () => true)
  .on(removeItemFx, () => true)
  .on(clearCartFx, () => true)
  .on(addToCartFx.finally, () => false)
  .on(updateQuantityFx.finally, () => false)
  .on(removeItemFx.finally, () => false)
  .on(clearCartFx.finally, () => false);

// ── Derived stores ───────────────────────────────────────

export const $cartItems = $cart.map((cart) => cart?.order_items ?? []);

export const $cartItemCount = $cartItems.map((items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const $cartSubtotal = $cart.map(
  (cart) => cart?.sub_total_price ?? "0,00 €",
);

export const $cartTotal = $cart.map((cart) => cart?.total_price ?? "0,00 €");

export const $cartTotalRaw = $cart.map((cart) => cart?.total_price_raw ?? 0);

export const $cartOrderId = $cart.map((cart) => cart?.order_id ?? null);

export const $isCartEmpty = $cartItems.map((items) => items.length === 0);

export const $cartAdjustments = $cart.map((cart) => cart?.adjustments ?? []);

export const $cartCoupons = $cart.map((cart) => cart?.coupons ?? []);

// ── Connections ──────────────────────────────────────────

/** Refetch cart when requested */
sample({
  clock: cartRefetchRequested,
  target: fetchCartFx,
});

// ── Init ─────────────────────────────────────────────────

/**
 * Initialize the cart on app load.
 * Call once in _app.tsx.
 *
 * Unlike the localStorage approach, this makes an API call
 * to fetch the current cart state from the backend.
 */
export const initCart = () => {
  if (typeof window === "undefined") return;
  fetchCartFx();
};
