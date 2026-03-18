import type { ProductDetailResponse } from "@/features/product/model/types";
import type { TaxonomyResponse } from "@/features/product-listing/model/types";
import type { Breadcrumb } from "@/core/types";

/**
 * JSON-LD structured data for Google rich snippets.
 *
 * These functions generate schema.org markup that tells Google
 * what the page contains — product prices, availability, ratings,
 * breadcrumbs, etc. This is what makes products show up in Google
 * with prices, stars, and "In Stock" labels.
 *
 * Usage in a component:
 *   <JsonLd data={generateProductJsonLd(product)} />
 */

// ── Product Detail (schema.org/Product) ──────────────────

export const generateProductJsonLd = (product: ProductDetailResponse) => {
  // Find the lowest and highest price across all variations
  const prices = product.variations
    .filter((v) => v.status && v.stock_level > 0)
    .map((v) => v.price_raw);

  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const hasStock = prices.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.body,
    sku: product.mastersku,
    brand: {
      "@type": "Brand",
      name: product.brand.name,
    },
    color: product.color_name,
    category: product.category,
    image: product.productMedia.map((media) => media.url),
    url: product.metaTags?.canonical_url ?? product.cleanUrl,
    offers: {
      "@type": lowPrice === highPrice ? "Offer" : "AggregateOffer",
      priceCurrency: "EUR",
      ...(lowPrice === highPrice
        ? { price: lowPrice }
        : { lowPrice, highPrice }),
      availability: hasStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Envie Shoes",
      },
    },
  };

  // Add aggregate rating if available
  if (product.aggregate_rating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.aggregate_rating.ratingValue,
      reviewCount: product.aggregate_rating.reviewCount,
    };
  }

  // Add reviews if available
  if (product.reviews && product.reviews.length > 0) {
    jsonLd.review = product.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      reviewBody: review.body,
      datePublished: review.date,
    }));
  }

  // Add product details as additionalProperty
  if (product.details.length > 0) {
    jsonLd.additionalProperty = product.details.map((detail) => ({
      "@type": "PropertyValue",
      name: detail.key,
      value: detail.value,
    }));
  }

  return jsonLd;
};

// ── Product Listing / Category (schema.org/CollectionPage) ─

export const generateProductListingJsonLd = (data: TaxonomyResponse) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.info.name,
    description: data.info.metaTags?.description ?? "",
    url: data.info.metaTags?.canonical_url ?? "",
    numberOfItems: data.pager.totalResults,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.pager.totalResults,
      itemListElement: data.data.map((product, index) => ({
        "@type": "ListItem",
        position:
          index + 1 + data.pager.currentPage * data.pager.numberOfElements,
        url: product.cleanUrl,
        item: {
          "@type": "Product",
          name: product.title,
          image: product.image[0]?.url,
          brand: {
            "@type": "Brand",
            name: product.brand,
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: product.price_raw,
            availability: product.sizes.some((s) => s.available)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      })),
    },
  };
};

// ── Breadcrumbs (schema.org/BreadcrumbList) ──────────────

export const generateBreadcrumbJsonLd = (
  breadcrumbs: Breadcrumb[],
  baseUrl = "",
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.path}`,
    })),
  };
};

// ── Organization (for site-wide usage) ───────────────────

export const generateOrganizationJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Envie Shoes",
    url: "https://www.envieshoes.gr",
    logo: "https://envieshoes-backend.rkpt.dev/themes/custom/rkpt/logo.png",
    sameAs: [
      "https://www.facebook.com/envieshoes",
      "https://www.instagram.com/envieshoes",
    ],
  };
};
