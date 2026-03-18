import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useUnit } from "effector-react";
import {
  $currentStep,
  $steps,
  $formData,
  $addressConfig,
  $orderResult,
  $isSubmitting,
  $isLoadingAddress,
  stepCompleted,
  stepNavigated,
  formDataUpdated,
  countryChanged,
  submitOrderFx,
  fetchAddressConfigFx,
  checkoutReset,
} from "../store/checkoutStore";
import {
  $cartItems,
  $cartSubtotal,
  $isCartEmpty,
} from "@/features/cart/store/cartStore";
import type { CheckoutFormData, CheckoutStep } from "../model/types";
import { formatPrice } from "@/core/lib/formatters";

const STEP_ORDER: CheckoutStep["id"][] = [
  "contact",
  "shipping",
  "payment",
  "review",
];

/**
 * Checkout page viewmodel.
 *
 * Manages the multi-step accordion flow:
 * 1. Contact info
 * 2. Shipping address (with dynamic fields per country)
 * 3. Payment method
 * 4. Review & submit
 */
export function useCheckoutViewModel() {
  const router = useRouter();
  const currentStep = useUnit($currentStep);
  const steps = useUnit($steps);
  const formData = useUnit($formData);
  const addressConfig = useUnit($addressConfig);
  const orderResult = useUnit($orderResult);
  const isSubmitting = useUnit($isSubmitting);
  const isLoadingAddress = useUnit($isLoadingAddress);
  const cartItems = useUnit($cartItems);
  const cartSubtotal = useUnit($cartSubtotal);
  const isCartEmpty = useUnit($isCartEmpty);

  // Redirect if cart is empty
  useEffect(() => {
    if (isCartEmpty) {
      router.replace("/cart");
    }
  }, [isCartEmpty, router]);

  // Fetch address config for default country on mount
  useEffect(() => {
    if (formData.country) {
      fetchAddressConfigFx(formData.country);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step navigation ────────────────────────────────────
  const handleStepComplete = useCallback((stepId: CheckoutStep["id"]) => {
    stepCompleted(stepId);

    // Auto-advance to next step
    const currentIndex = STEP_ORDER.indexOf(stepId);
    if (currentIndex < STEP_ORDER.length - 1) {
      stepNavigated(STEP_ORDER[currentIndex + 1]);

      // Scroll the next step into view
      setTimeout(() => {
        const el = document.getElementById(
          `step-${STEP_ORDER[currentIndex + 1]}`,
        );
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  const handleStepClick = useCallback(
    (stepId: CheckoutStep["id"]) => {
      // Only allow navigating to completed steps or the current step
      const step = steps.find((s) => s.id === stepId);
      if (step?.completed || stepId === currentStep) {
        stepNavigated(stepId);
      }
    },
    [steps, currentStep],
  );

  // ── Form updates ───────────────────────────────────────
  const handleFormChange = useCallback((data: Partial<CheckoutFormData>) => {
    formDataUpdated(data);
  }, []);

  const handleCountryChange = useCallback((country: string) => {
    countryChanged(country);
  }, []);

  // ── Submit order ───────────────────────────────────────
  const handleSubmitOrder = useCallback(async () => {
    await submitOrderFx({
      items: cartItems,
      checkout: formData as CheckoutFormData,
    });
  }, [cartItems, formData]);

  // ── Cleanup on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      // Only reset if order was placed (not on accidental navigation)
      if (orderResult) {
        checkoutReset();
      }
    };
  }, [orderResult]);

  return {
    // State
    currentStep,
    steps,
    formData,
    addressConfig,
    orderResult,
    isSubmitting,
    isLoadingAddress,
    cartItems,

    // Computed
    formattedSubtotal: formatPrice(Number(cartSubtotal)),
    isCartEmpty,

    // Actions
    onStepComplete: handleStepComplete,
    onStepClick: handleStepClick,
    onFormChange: handleFormChange,
    onCountryChange: handleCountryChange,
    onSubmitOrder: handleSubmitOrder,
  };
}
