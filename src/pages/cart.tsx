import Head from "next/head";
import { CartSection } from "@/features/cart/components/CartSection";

/**
 * Cart page.
 *
 * No getServerSideProps needed — cart is fully client-side
 * (persisted in localStorage, synced across tabs via storage events).
 */
export default function CartPage() {
  return (
    <>
      <Head>
        <title>Cart — Store</title>
      </Head>

      <CartSection />
    </>
  );
}
