import type { AppProps } from "next/app";
import { useEffect } from "react";
import { MainLayout } from "@/core/layouts/MainLayout";
import { initCartPersistence } from "@/features/cart/store/cartStore";
import { useScrollRestoration } from "@/core/hooks/useScrollRestoration";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  // Initialize cart localStorage persistence + cross-tab sync
  useEffect(() => {
    initCartPersistence();
  }, []);

  // Restore scroll on back navigation
  useScrollRestoration();

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
