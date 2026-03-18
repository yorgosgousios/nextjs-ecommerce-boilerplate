import { createStore, createEvent, createEffect, sample } from "effector";
import type {
  CheckoutFormData,
  CheckoutStep,
  CountryAddressConfig,
  OrderResponse,
} from "../model/types";
import { submitOrder, fetchAddressConfig } from "../service/checkoutService";
import { $cartItems, clearCart } from "@/features/cart/store/cartStore";

// ── Events ───────────────────────────────────────────────
export const stepCompleted = createEvent<CheckoutStep["id"]>();
export const stepNavigated = createEvent<CheckoutStep["id"]>();
export const formDataUpdated = createEvent<Partial<CheckoutFormData>>();
export const countryChanged = createEvent<string>();
export const checkoutReset = createEvent();

// ── Effects ──────────────────────────────────────────────
export const submitOrderFx = createEffect(submitOrder);
export const fetchAddressConfigFx = createEffect(fetchAddressConfig);

// ── Stores ───────────────────────────────────────────────

export const $currentStep = createStore<CheckoutStep["id"]>("contact")
  .on(stepNavigated, (_, step) => step)
  .reset(checkoutReset);

export const $steps = createStore<CheckoutStep[]>([
  { id: "contact", label: "Contact", completed: false },
  { id: "shipping", label: "Shipping", completed: false },
  { id: "payment", label: "Payment", completed: false },
  { id: "review", label: "Review", completed: false },
])
  .on(stepCompleted, (steps, completedId) =>
    steps.map((s) => (s.id === completedId ? { ...s, completed: true } : s))
  )
  .reset(checkoutReset);

export const $formData = createStore<Partial<CheckoutFormData>>({
  country: "GR",
  paymentMethod: "card",
})
  .on(formDataUpdated, (state, payload) => ({ ...state, ...payload }))
  .reset(checkoutReset);

export const $addressConfig = createStore<CountryAddressConfig | null>(null)
  .on(fetchAddressConfigFx.doneData, (_, config) => config)
  .reset(checkoutReset);

export const $orderResult = createStore<OrderResponse | null>(null)
  .on(submitOrderFx.doneData, (_, result) => result)
  .reset(checkoutReset);

export const $isSubmitting = submitOrderFx.pending;
export const $isLoadingAddress = fetchAddressConfigFx.pending;

// ── Connections ──────────────────────────────────────────

// Fetch address config when country changes
sample({
  clock: countryChanged,
  target: fetchAddressConfigFx,
});

// Also update formData country field
sample({
  clock: countryChanged,
  fn: (country) => ({ country }),
  target: formDataUpdated,
});

// Clear cart on successful order
sample({
  clock: submitOrderFx.done,
  target: clearCart,
});
