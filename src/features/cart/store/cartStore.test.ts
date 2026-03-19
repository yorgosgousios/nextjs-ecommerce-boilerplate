import { describe, it, expect } from "vitest";
import { fork, allSettled } from "effector";
import {
  $cart,
  $cartItems,
  $cartItemCount,
  $cartOrderId,
  $isCartEmpty,
  $cartTotal,
  $cartSubtotal,
  $cartIsMutating,
  fetchCartFx,
  addToCartFx,
  clearCartFx,
} from "@/features/cart/store/cartStore";
import type { CartResponse } from "@/features/cart/model/types";

/**
 * Cart store tests use Effector's fork() API.
 *
 * fork() creates an isolated scope — each test gets its own
 * copy of the stores, so tests don't leak state into each other.
 * This is the recommended way to test Effector stores.
 */

const mockCartResponse: CartResponse = {
  order_id: 1118738,
  order_items: [
    {
      order_item_id: 2442670,
      product_id: "34522",
      marketing_category: [],
      type: "default",
      product_title: "SLINGBACK PUMPS",
      sku: "E02-22101-34--38",
      variation_id: 133840,
      variation_size: "38",
      stock_level: 5,
      availability: "Άμεσα Διαθέσιμο",
      quantity: 1,
      image: [{ alt: "Test", url: "https://example.com/img.jpg" }],
      category: "ΓΥΝΑΙΚΕΙΑ",
      brand: "Envie Shoes",
      list_price_raw: 99.9,
      list_price: "99,90 €",
      unit_price_raw: 49.9,
      unit_price: "49,90 €",
      price_raw: 49.9,
      price: "49,90 €",
      currency: "EUR",
      path: "/gynaikeia/gobes/envie-shoes/slingback-pumps-mayro",
      color_name: "ΜΑΥΡΟ",
      ga4_category: ["ΓΥΝΑΙΚΕΙΑ", "Γόβες"],
    },
  ],
  adjustments: [
    {
      type: "tax",
      label: "Φ.Π.Α.",
      amount_raw: 9.66,
      amount: "9,66 €",
      percentage: 0.24,
      description: null,
    },
  ],
  giftcards_wallet: [],
  sub_total_price_raw: 49.9,
  sub_total_price: "49,90 €",
  total_price_raw: 49.9,
  total_price: "49,90 €",
  coupons: [],
  suggestions: [],
};

const mockCartTwoItems: CartResponse = {
  ...mockCartResponse,
  order_items: [
    ...mockCartResponse.order_items,
    {
      ...mockCartResponse.order_items[0],
      order_item_id: 2442671,
      product_title: "CHUNKY SNEAKERS",
      quantity: 2,
      unit_price_raw: 69.9,
      price_raw: 139.8,
      price: "139,80 €",
    },
  ],
  total_price_raw: 189.7,
  total_price: "189,70 €",
};

describe("Cart Store", () => {
  // ── $cart ─────────────────────────────────────────────

  describe("$cart", () => {
    it("starts as null", () => {
      const scope = fork();
      expect(scope.getState($cart)).toBeNull();
    });

    it("populates on fetchCartFx success", async () => {
      const scope = fork({
        handlers: [[fetchCartFx, () => mockCartResponse]],
      });

      await allSettled(fetchCartFx, { scope });
      expect(scope.getState($cart)).toEqual(mockCartResponse);
    });

    it("replaces entire cart on addToCartFx success", async () => {
      const scope = fork({
        handlers: [[addToCartFx, () => mockCartTwoItems]],
      });

      await allSettled(addToCartFx, {
        scope,
        params: {
          purchased_entity_type: "commerce_product_variation" as const,
          purchased_entity_id: 133840,
          quantity: 1,
          combine: true,
        },
      });

      expect(scope.getState($cart)?.order_items).toHaveLength(2);
    });

    it("resets to null on clearCartFx success", async () => {
      const scope = fork({
        values: [[$cart, mockCartResponse]],
        handlers: [[clearCartFx, () => undefined]],
      });

      expect(scope.getState($cart)).not.toBeNull();

      await allSettled(clearCartFx, { scope, params: 1118738 });
      expect(scope.getState($cart)).toBeNull();
    });
  });

  // ── Derived stores ────────────────────────────────────

  describe("derived stores", () => {
    it("$cartItems extracts order_items", () => {
      const scope = fork({ values: [[$cart, mockCartResponse]] });
      expect(scope.getState($cartItems)).toHaveLength(1);
      expect(scope.getState($cartItems)[0].product_title).toBe(
        "SLINGBACK PUMPS",
      );
    });

    it("$cartItems returns empty array when cart is null", () => {
      const scope = fork({ values: [[$cart, null]] });
      expect(scope.getState($cartItems)).toEqual([]);
    });

    it("$cartItemCount sums quantities", () => {
      const scope = fork({ values: [[$cart, mockCartTwoItems]] });
      // 1 + 2 = 3
      expect(scope.getState($cartItemCount)).toBe(3);
    });

    it("$cartOrderId extracts order_id", () => {
      const scope = fork({ values: [[$cart, mockCartResponse]] });
      expect(scope.getState($cartOrderId)).toBe(1118738);
    });

    it("$cartOrderId returns null when cart is null", () => {
      const scope = fork({ values: [[$cart, null]] });
      expect(scope.getState($cartOrderId)).toBeNull();
    });

    it("$isCartEmpty is true when no items", () => {
      const scope = fork({ values: [[$cart, null]] });
      expect(scope.getState($isCartEmpty)).toBe(true);
    });

    it("$isCartEmpty is false when items exist", () => {
      const scope = fork({ values: [[$cart, mockCartResponse]] });
      expect(scope.getState($isCartEmpty)).toBe(false);
    });

    it("$cartTotal returns formatted total", () => {
      const scope = fork({ values: [[$cart, mockCartResponse]] });
      expect(scope.getState($cartTotal)).toBe("49,90 €");
    });

    it("$cartSubtotal returns formatted subtotal", () => {
      const scope = fork({ values: [[$cart, mockCartResponse]] });
      expect(scope.getState($cartSubtotal)).toBe("49,90 €");
    });

    it("$cartTotal returns default when cart is null", () => {
      const scope = fork({ values: [[$cart, null]] });
      expect(scope.getState($cartTotal)).toBe("0,00 €");
    });
  });

  // ── Loading states ────────────────────────────────────

  describe("loading states", () => {
    it("$cartIsMutating is true while addToCartFx is pending", async () => {
      let resolve: (value: CartResponse) => void;
      const promise = new Promise<CartResponse>((r) => {
        resolve = r;
      });

      const scope = fork({
        handlers: [[addToCartFx, () => promise]],
      });

      const settled = allSettled(addToCartFx, {
        scope,
        params: {
          purchased_entity_type: "commerce_product_variation" as const,
          purchased_entity_id: 133840,
          quantity: 1,
          combine: true,
        },
      });

      // While pending
      expect(scope.getState($cartIsMutating)).toBe(true);

      // Resolve
      resolve!(mockCartResponse);
      await settled;

      expect(scope.getState($cartIsMutating)).toBe(false);
    });
  });
});
