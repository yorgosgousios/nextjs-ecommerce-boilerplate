import Link from "next/link";
import Head from "next/head";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found — Store</title>
      </Head>
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 style={{ fontSize: "4rem", color: "#ddd" }}>404</h1>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Page not found
        </h2>
        <p style={{ color: "#999", marginBottom: "2rem" }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            padding: "0.75rem 2rem",
            background: "#2d6a8f",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to homepage
        </Link>
      </div>
    </>
  );
}
