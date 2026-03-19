import { useCallback } from "react";
import { useUnit } from "effector-react";
import {
  $cart,
  $cartItems,
  $cartItemCount,
  $cartSubtotal,
  $cartTotal,
  $cartOrderId,
  $isCartEmpty,
  $cartIsLoading,
  $cartIsMutating,
  $cartAdjustments,
  $cartCoupons,
  addToCartFx,
  updateQuantityFx,
  removeItemFx,
  clearCartFx,
  cartRefetchRequested,
} from "../store/cartStore";

/**
 * Cart viewmodel.
 *
 * Used by:
 * - Cart page (full cart view)
 * - Cart badge in header (item count)
 * - Product detail page (add to cart button)
 * - Mini cart / cart drawer
 */
export const CartViewModel = () => {
  const cart = useUnit($cart);
  const items = useUnit($cartItems);
  const itemCount = useUnit($cartItemCount);
  const subtotal = useUnit($cartSubtotal);
  const total = useUnit($cartTotal);
  const orderId = useUnit($cartOrderId);
  const isEmpty = useUnit($isCartEmpty);
  const isLoading = useUnit($cartIsLoading);
  const isMutating = useUnit($cartIsMutating);
  const adjustments = useUnit($cartAdjustments);
  const coupons = useUnit($cartCoupons);

  const handleAddToCart = useCallback((variationId: number, quantity = 1) => {
    addToCartFx({
      purchased_entity_type: "commerce_product_variation",
      purchased_entity_id: variationId,
      quantity,
      combine: true,
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (orderItemId: number, quantity: number) => {
      if (!orderId) return;
      updateQuantityFx({ orderId, orderItemId, quantity });
    },
    [orderId],
  );

  const handleRemoveItem = useCallback(
    (orderItemId: number) => {
      if (!orderId) return;
      removeItemFx({ orderId, orderItemId });
    },
    [orderId],
  );

  const handleRefetch = useCallback(() => {
    cartRefetchRequested();
  }, []);

  const handleClearCart = useCallback(() => {
    if (!orderId) return;
    clearCartFx(orderId);
  }, [orderId]);

  return {
    // State
    cart,
    items,
    itemCount,
    subtotal,
    total,
    orderId,
    isEmpty,
    isLoading,
    isMutating,
    adjustments,
    coupons,

    // Actions
    onAddToCart: handleAddToCart,
    onUpdateQuantity: handleUpdateQuantity,
    onRemoveItem: handleRemoveItem,
    onClearCart: handleClearCart,
    onRefetch: handleRefetch,
  };
};
