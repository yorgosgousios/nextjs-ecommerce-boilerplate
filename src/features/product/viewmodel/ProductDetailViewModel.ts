import { useCallback, useState, useMemo } from "react";
import type { ProductDetailResponse, ProductVariation } from "../model/types";
import { addToCartFx } from "@/features/cart/store/cartStore";

interface UseProductDetailParams {
  product: ProductDetailResponse;
}

/**
 * Product detail page viewmodel.
 *
 * Manages:
 * - Selected variation (size)
 * - Image gallery state
 * - Quantity selection
 * - Add-to-cart action
 */
export const ProductDetailViewModel = ({ product }: UseProductDetailParams) => {
  // Default to the first available variation
  const defaultVariation = useMemo(
    () =>
      product.variations.find((v) => v.stock_level > 0) ??
      product.variations[0],
    [product.variations],
  );

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation>(defaultVariation);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleVariationSelect = useCallback(
    (variationId: number) => {
      const variation = product.variations.find((v) => v.id === variationId);
      if (variation) setSelectedVariation(variation);
    },
    [product.variations],
  );

  const handleAddToCart = useCallback(() => {
    addToCartFx([
      {
        purchased_entity_id: Number(product.variations[0].id),
        purchased_entity_type: "commerce_product_variation",
        quantity,
        combine: true,
      },
    ]);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  }, []);

  return {
    // State
    product,
    selectedVariation,
    selectedImageIndex,
    quantity,
    addedToCart,

    // Computed
    currentImage: product.productMedia[selectedImageIndex] ?? null,
    isOnSale: selectedVariation.discount_percentage !== null,
    isInStock: selectedVariation.stock_level > 0,
    availableVariations: product.variations.filter((v) => v.status),

    // Actions
    onVariationSelect: handleVariationSelect,
    onImageSelect: setSelectedImageIndex,
    onQuantityChange: handleQuantityChange,
    onAddToCart: handleAddToCart,
  };
};
