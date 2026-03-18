import Head from "next/head";
import Link from "next/link";

/**
 * Home page.
 *
 * TODO: Wire up to /api/v1/homepage endpoint for featured products,
 * banners, and promotional sections.
 */
const HomePage = () => {
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
          href="/gynaikeia"
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
    </>
  );
};

export default HomePage;
