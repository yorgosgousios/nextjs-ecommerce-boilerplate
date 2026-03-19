import type { AppProps } from "next/app";
import { useEffect } from "react";
import { MainLayout } from "@/core/layouts/MainLayout";
import ErrorBoundary from "@/core/ui/ErrorBoundary";
import { initCart } from "@/features/cart/store/cartStore";
import { useScrollRestoration } from "@/core/hooks/useScrollRestoration";
import { inter } from "@/core/lib/fonts";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  // Fetch cart from backend on app load
  useEffect(() => {
    initCart();
  }, []);

  // Restore scroll on back navigation
  useScrollRestoration();

  return (
    <div className={inter.className}>
      <MainLayout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </MainLayout>
    </div>
  );
}
