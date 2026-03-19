/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { resolveRoute } from "@/core/api/routerService";
import { getPageDataByType } from "@/core/api/pageResolver";

// SEO
import { JsonLd } from "@/core/seo/JsonLd";
import {
  generateProductJsonLd,
  generateProductListingJsonLd,
  generateBreadcrumbJsonLd,
} from "@/core/seo/structuredData";
import { ProductListSection } from "@/features/product-listing/components/ProductListSection";

// Feature components — dynamically imported
// Only the component needed for the current page type is loaded.
// The rest are split into separate chunks and never downloaded.
const ProductDetail = dynamic(() =>
  import("@/features/product/components/ProductDetail").then(
    (m) => m.ProductDetail,
  ),
);
const BlogView = dynamic(() =>
  import("@/features/blog/components/BlogComponents").then((m) => m.BlogView),
);
const BlogListView = dynamic(() =>
  import("@/features/blog/components/BlogComponents").then(
    (m) => m.BlogListView,
  ),
);
const BasicPageView = dynamic(() =>
  import("@/features/basic-page/components/BasicPageView").then(
    (m) => m.BasicPageView,
  ),
);
const LandingPageView = dynamic(() =>
  import("@/features/landing/components/LandingPageView").then(
    (m) => m.LandingPageView,
  ),
);
const PageGone = dynamic(() =>
  import("@/core/ui/PageGone").then((m) => m.PageGone),
);

// ─────────────────────────────────────────────────────────
// Render component by pageType
// ─────────────────────────────────────────────────────────

const renderPageByType = (pageType: string, pageData: any) => {
  switch (pageType) {
    case "product":
      return <ProductDetail product={pageData} />;

    case "product_listing":
      // TODO: Replace with proper ProductListView component
      return (
        <div>
          <h1>Product Listing</h1>
          <ProductListSection initialData={pageData} />
          {/* <pre
            style={{ fontSize: "12px", maxHeight: "80vh", overflow: "auto" }}
          >
            {JSON.stringify(pageData, null, 2)}
          </pre> */}
        </div>
      );

    case "blog":
      return <BlogView post={pageData} />;

    case "blog_listing":
      return <BlogListView listing={pageData} />;

    case "basic_page":
      return <BasicPageView page={pageData} />;

    case "landing_page":
      return <LandingPageView page={pageData} />;

    case "gone":
      return <PageGone />;

    default:
      return null;
  }
};

// ─────────────────────────────────────────────────────────
// Page props
// ─────────────────────────────────────────────────────────

interface CatchAllPageProps {
  page: {
    pageType: string;
    id: number;
    type: string;
    bundle: string;
    path: string;
  };

  pageData: any;
  meta: {
    title: string;
    description: string;
    ogImage: string | null;
  };
}

// ─────────────────────────────────────────────────────────
// Structured data (JSON-LD) by pageType
// ─────────────────────────────────────────────────────────

const getStructuredData = (pageType: string, pageData: any) => {
  switch (pageType) {
    case "product":
      return (
        <>
          <JsonLd data={generateProductJsonLd(pageData)} />
          {pageData.breadcrumbs && (
            <JsonLd data={generateBreadcrumbJsonLd(pageData.breadcrumbs)} />
          )}
        </>
      );

    case "product_listing":
      return (
        <>
          <JsonLd data={generateProductListingJsonLd(pageData)} />
          {pageData.breadcrumbs && (
            <JsonLd data={generateBreadcrumbJsonLd(pageData.breadcrumbs)} />
          )}
        </>
      );

    default:
      return null;
  }
};

// ─────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────

const CatchAllPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { page, pageData, meta } = props as CatchAllPageProps;

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
        {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}
        <meta property="og:title" content={meta.title} />
        {getStructuredData(page.pageType, pageData)}
      </Head>

      {renderPageByType(page.pageType, pageData)}
    </>
  );
};

export default CatchAllPage;

// ─────────────────────────────────────────────────────────
// Server-Side Data Fetching
// ─────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<CatchAllPageProps> = async (
  ctx,
) => {
  const slugParts = ctx.params?.slug as string[] | undefined;
  const path = slugParts?.join("/") ?? "";
  const locale = ctx.locale ?? ctx.defaultLocale ?? "el";

  // ── Step 1: Resolve the route ──────────────────────────
  const routeData = await resolveRoute(path, locale);

  if (!routeData) {
    return { notFound: true };
  }

  // Handle redirects
  if (
    routeData.redirect &&
    typeof routeData.redirect === "string" &&
    routeData.path !== `/${path}`
  ) {
    return {
      redirect: {
        destination: routeData.path,
        permanent: routeData.status === 301,
      },
    };
  }

  // Handle gone (410)
  if (routeData.status === 410 || routeData.type === "gone") {
    return {
      props: {
        page: { pageType: "gone", id: 0, type: "gone", bundle: "", path },
        pageData: null,
        meta: { title: "Page Gone", description: "", ogImage: null },
      },
    };
  }

  // ── Step 2: Find the service function ──────────────────
  const entry = getPageDataByType(routeData);

  if (!entry) {
    console.error(
      "[CatchAllPage] No service for:",
      routeData.type,
      routeData.bundle,
    );
    return { notFound: true };
  }

  // ── Step 3: Fetch the page data ────────────────────────
  try {
    const pageData = await entry.apiGetPageData(routeData.id, 0);

    if (!pageData) {
      return { notFound: true };
    }

    const page = {
      pageType: entry.pageType,
      id: routeData.id,
      type: routeData.type,
      bundle: routeData.bundle,
      path: routeData.path,
    };

    const metaTags = pageData?.info?.metaTags ?? pageData?.metaTags;

    const meta = {
      title:
        metaTags?.title ??
        pageData?.title ??
        pageData?.info?.name ??
        pageData?.name ??
        "Store",
      description: metaTags?.description ?? pageData?.body?.slice(0, 160) ?? "",
      ogImage:
        metaTags?.["og:image"] ??
        pageData?.productMedia?.[0]?.url ??
        pageData?.image ??
        null,
    };

    return {
      props: {
        page,
        pageData,
        meta,
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      console.error(
        "[CatchAllPage] Data not found for:",
        routeData.type,
        routeData.id,
      );
      return { notFound: true };
    }

    console.error(
      "[CatchAllPage] Server error:",
      status ?? "network error",
      error?.message,
    );
    throw error;
  }
};
