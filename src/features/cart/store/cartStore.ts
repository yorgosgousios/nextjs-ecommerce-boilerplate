import { createStore, createEvent, createEffect, sample } from "effector";
import type { CartItem, AddToCartPayload, CartValidationResponse } from "../model/types";
import { validateCart } from "../service/cartService";

// ── Events ───────────────────────────────────────────────
export const addToCart = createEvent<AddToCartPayload>();
export const removeFromCart = createEvent<string>(); // productId
export const updateQuantity = createEvent<{
  productId: string;
  quantity: number;
}>();
export const clearCart = createEvent();
export const cartSyncedFromStorage = createEvent<CartItem[]>();

// ── Effects ──────────────────────────────────────────────
export const validateCartFx = createEffect(validateCart);

// ── Stores ───────────────────────────────────────────────

export const $cartItems = createStore<CartItem[]>([])
  .on(addToCart, (items, payload) => {
    const existing = items.find((i) => i.productId === payload.productId);
    if (existing) {
      return items.map((i) =>
        i.productId === payload.productId
          ? { ...i, quantity: i.quantity + payload.quantity }
          : i
      );
    }
    return [...items, { ...payload }];
  })
  .on(removeFromCart, (items, productId) =>
    items.filter((i) => i.productId !== productId)
  )
  .on(updateQuantity, (items, { productId, quantity }) => {
    if (quantity < 1) return items.filter((i) => i.productId !== productId);
    return items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
  })
  .on(validateCartFx.doneData, (_, result) => result.updatedItems)
  .on(cartSyncedFromStorage, (_, items) => items)
  .reset(clearCart);

// ── Derived stores ───────────────────────────────────────

export const $cartItemCount = $cartItems.map((items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartSubtotal = $cartItems.map((items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const $isCartEmpty = $cartItems.map((items) => items.length === 0);

export const $isValidating = validateCartFx.pending;

// ── Persistence (client-side only) ───────────────────────

const CART_STORAGE_KEY = "cart_items";

/**
 * Subscribe to cart changes and persist to localStorage.
 * Also listens for storage events to sync across tabs.
 *
 * Call this once in _app.tsx.
 */
export function initCartPersistence() {
  if (typeof window === "undefined") return;

  // Load from localStorage on init
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored) as CartItem[];
      cartSyncedFromStorage(items);
    }
  } catch {
    // Corrupted data — start fresh
  }

  // Persist on every change
  $cartItems.watch((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  });

  // Cross-tab synchronization
  window.addEventListener("storage", (event) => {
    if (event.key !== CART_STORAGE_KEY || !event.newValue) return;
    try {
      const items = JSON.parse(event.newValue) as CartItem[];
      cartSyncedFromStorage(items);
    } catch {
      // Ignore malformed data
    }
  });
}
