import Head from "next/head";
import { CartSection } from "@/features/cart/components/CartSection";

const CartPage = () => {
  return (
    <>
      <Head>
        <title>Καλάθι — Store</title>
        <meta name="robots" content="noindex" />
      </Head>

      <CartSection />
    </>
  );
};

export default CartPage;
