import { useCallback } from "react";
import { useRouter } from "next/router";
import { useUnit } from "effector-react";
import {
  $cartItems,
  $cartItemCount,
  $cartSubtotal,
  $isCartEmpty,
  $isValidating,
  removeFromCart,
  updateQuantity,
  clearCart,
  validateCartFx,
} from "../store/cartStore";
import { formatPrice } from "@/core/lib/formatters";

/**
 * Cart page viewmodel.
 *
 * Exposes cart state and actions to the CartPage component.
 * Handles validation before checkout navigation.
 */
export function useCartViewModel() {
  const router = useRouter();
  const items = useUnit($cartItems);
  const itemCount = useUnit($cartItemCount);
  const subtotal = useUnit($cartSubtotal);
  const isEmpty = useUnit($isCartEmpty);
  const isValidating = useUnit($isValidating);

  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId);
  }, []);

  const handleQuantityChange = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity({ productId, quantity });
    },
    []
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, []);

  const handleProceedToCheckout = useCallback(async () => {
    // Validate cart with backend before proceeding
    try {
      const result = await validateCartFx(items);
      if (result.valid) {
        router.push("/checkout");
      }
      // If invalid, the store is automatically updated with correct items
      // via the validateCartFx.doneData handler
    } catch {
      // Network error — let user retry
    }
  }, [items, router]);

  return {
    // State
    items,
    itemCount,
    subtotal,
    isEmpty,
    isValidating,

    // Formatted
    formattedSubtotal: formatPrice(subtotal),

    // Actions
    onRemove: handleRemove,
    onQuantityChange: handleQuantityChange,
    onClearCart: handleClearCart,
    onProceedToCheckout: handleProceedToCheckout,
  };
}
