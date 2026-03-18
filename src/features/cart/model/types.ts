export interface CartItem {
  productId: string;
  name: string;
  /** Price in cents */
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

/** Payload for adding an item to cart */
export interface AddToCartPayload {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/** API response when validating cart */
export interface CartValidationResponse {
  valid: boolean;
  updatedItems: CartItem[];
  removedProductIds: string[];
  message?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  /** Cost in cents */
  cost: number;
  estimatedDays: string;
}
