import Head from "next/head";
import { CheckoutSection } from "@/features/checkout/components/CheckoutSection";

/**
 * Checkout page.
 *
 * Fully client-side — the viewmodel validates cart, manages the
 * multi-step form, and submits the order.
 */
export default function CheckoutPage() {
  return (
    <>
      <Head>
        <title>Checkout — Store</title>
      </Head>

      <h1 style={{ marginBottom: "1.5rem" }}>Checkout</h1>
      <CheckoutSection />
    </>
  );
}
