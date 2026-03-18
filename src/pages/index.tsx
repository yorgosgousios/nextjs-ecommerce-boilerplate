import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { fetchProducts } from "@/features/products/service/productsService";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/model/types";

interface HomePageProps {
  featuredProducts: Product[];
}

/**
 * Home page.
 *
 * SSR fetches featured products.
 * This is a "thin page" — it fetches data and renders, no viewmodel needed
 * because there's no interactive state to manage.
 */
export default function HomePage({ featuredProducts }: HomePageProps) {
  return (
    <>
      <Head>
        <title>Store — Home</title>
        <meta name="description" content="Welcome to our store" />
      </Head>

      <section style={{ textAlign: "center", padding: "3rem 0" }}>
        <h1>Welcome to the Store</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Discover our latest products
        </p>
        <Link
          href="/products"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.75rem 2rem",
            background: "#2d6a8f",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Shop All Products
        </Link>
      </section>

      <section>
        <h2 style={{ marginBottom: "1.5rem" }}>Featured Products</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    const response = await fetchProducts({ sortBy: "newest", page: 1 });
    return {
      props: {
        featuredProducts: response.products.slice(0, 8),
      },
    };
  } catch {
    return {
      props: {
        featuredProducts: [],
      },
    };
  }
};
