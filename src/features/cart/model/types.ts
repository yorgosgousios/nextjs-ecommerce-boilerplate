/* eslint-disable @typescript-eslint/no-explicit-any */
// ─────────────────────────────────────────────────────────
// Cart API Types
// ─────────────────────────────────────────────────────────

import type { ProductImage } from "@/core/types";

/** GET /api/v1/cart response */
export interface CartResponse {
  order_id: number;
  order_items: CartOrderItem[];
  adjustments: CartAdjustment[];
  giftcards_wallet: any[];
  sub_total_price_raw: number;
  sub_total_price: string;
  total_price_raw: number;
  total_price: string;
  coupons: CartCoupon[];
  suggestions: any[];
}

export interface CartOrderItem {
  order_item_id: number;
  product_id: string;
  marketing_category: string[];
  type: string;
  product_title: string;
  sku: string;
  variation_id: number;
  variation_size: string;
  stock_level: number;
  availability: string;
  quantity: number;
  image: ProductImage[];
  category: string;
  brand: string;
  list_price_raw: number;
  list_price: string;
  unit_price_raw: number;
  unit_price: string;
  price_raw: number;
  price: string;
  currency: string;
  path: string;
  color_name: string;
  ga4_category: string[];
}

export interface CartAdjustment {
  type: string;
  label: string;
  amount_raw: number;
  amount: string;
  percentage: number;
  description: string | null;
}

export interface CartCoupon {
  code: string;
  amount_raw: number;
  amount: string;
}

/** POST /api/v1/cart/add request body item */
export interface AddToCartPayload {
  purchased_entity_type: "commerce_product_variation";
  purchased_entity_id: number;
  quantity: number;
  combine: boolean;
}

/** PATCH /api/v1/cart/{order_id}/items/{order_item_id} request body */
export interface UpdateQuantityPayload {
  quantity: number;
}
