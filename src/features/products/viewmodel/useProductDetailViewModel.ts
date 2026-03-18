import { useCallback, useState } from "react";
import type { Product } from "../model/types";
import { addToCart } from "@/features/cart/store/cartStore";

interface UseProductDetailParams {
  /** Product passed from getServerSideProps */
  product: Product;
}

/**
 * Product detail page viewmodel.
 *
 * Receives SSR product data and exposes:
 * - Image gallery state (selected image index)
 * - Quantity selection
 * - Add-to-cart action (delegates to cart store)
 */
export function useProductDetailViewModel({ product }: UseProductDetailParams) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = useCallback(() => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0] ?? "",
      quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) return;
      setQuantity(newQuantity);
    },
    []
  );

  return {
    // State
    product,
    selectedImageIndex,
    quantity,
    addedToCart,

    // Computed
    currentImage: product.images[selectedImageIndex] ?? "",
    effectivePrice: product.salePrice ?? product.price,
    isOnSale: product.salePrice !== undefined && product.salePrice < product.price,

    // Actions
    onImageSelect: setSelectedImageIndex,
    onQuantityChange: handleQuantityChange,
    onAddToCart: handleAddToCart,
  };
}
