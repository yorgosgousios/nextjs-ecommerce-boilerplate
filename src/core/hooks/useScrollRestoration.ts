import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Saves and restores scroll position when navigating back.
 * Works with Next.js Pages Router.
 *
 * Usage: call `useScrollRestoration()` in your _app.tsx
 */
export function useScrollRestoration() {
  const router = useRouter();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    // Let us handle scroll ourselves
    window.history.scrollRestoration = "manual";

    const scrollPositions: Record<string, number> = {};
    let shouldRestore = false;

    const onBeforeUnload = () => {
      scrollPositions[router.asPath] = window.scrollY;
    };

    const onRouteChangeStart = () => {
      scrollPositions[router.asPath] = window.scrollY;
    };

    const onRouteChangeComplete = (url: string) => {
      if (shouldRestore && scrollPositions[url] !== undefined) {
        window.requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositions[url]);
        });
      }
      shouldRestore = false;
    };

    /**
     * `beforePopState` fires on back/forward navigation.
     * We set a flag so `onRouteChangeComplete` knows to restore.
     */
    router.beforePopState(() => {
      shouldRestore = true;
      return true;
    });

    window.addEventListener("beforeunload", onBeforeUnload);
    router.events.on("routeChangeStart", onRouteChangeStart);
    router.events.on("routeChangeComplete", onRouteChangeComplete);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events.off("routeChangeStart", onRouteChangeStart);
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, [router]);
}
