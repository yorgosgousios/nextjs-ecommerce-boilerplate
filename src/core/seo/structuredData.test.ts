import { describe, it, expect } from "vitest";
import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from "@/core/seo/structuredData";
import type { ProductDetailResponse } from "@/features/product/model/types";

const mockProduct: ProductDetailResponse = {
  listing_weight: "21_E02-19180-36",
  mastersku: "E02-19180-36",
  product_id: "30944",
  title: "PLATFORM HEEL MULES",
  status: true,
  body: "Envie mules Ελληνικής παραγωγής",
  brand: {
    name: "Envie Shoes",
    cleanUrl: "/brand/envie-shoes",
    logo: { alt: "Envie Shoes", url: "https://example.com/logo.png" },
  },
  color_name: "ΜΠΕΖ",
  category: "Mules",
  marketing_category: [],
  is_leather: false,
  details: [
    { key: "Υλικό", value: "Συνθετικό Δέρμα", cleanUrl: "" },
    { key: "Ύψος Τακουνιού", value: "13", cleanUrl: "" },
  ],
  tag_label: null,
  availability: null,
  availability_message: null,
  productMedia: [
    { type: "image", url: "https://example.com/img1.jpg", alt: "Product" },
    { type: "image", url: "https://example.com/img2.jpg", alt: "Product" },
  ],
  variations: [
    {
      name: "37",
      id: 112353,
      sku: "E02-19180-36--37",
      currency: "EUR",
      list_price_raw: null,
      list_price: null,
      price_raw: 89.9,
      price: "89,90 €",
      discount_percentage_raw: null,
      discount_percentage: null,
      attributes: [{ attribute_type: "shoe_size", attribute_name: "37" }],
      stock_level: 7,
      availability: "Άμεσα Διαθέσιμο",
      availability_message: null,
      status: true,
    },
    {
      name: "38",
      id: 112354,
      sku: "E02-19180-36--38",
      currency: "EUR",
      list_price_raw: null,
      list_price: null,
      price_raw: 89.9,
      price: "89,90 €",
      discount_percentage_raw: null,
      discount_percentage: null,
      attributes: [{ attribute_type: "shoe_size", attribute_name: "38" }],
      stock_level: 9,
      availability: "Άμεσα Διαθέσιμο",
      availability_message: null,
      status: true,
    },
    {
      name: "36",
      id: 112352,
      sku: "E02-19180-36--36",
      currency: "EUR",
      list_price_raw: 49999,
      list_price: "49.999,00 €",
      price_raw: 100,
      price: "100,00 €",
      discount_percentage_raw: 100,
      discount_percentage: "-100%",
      attributes: [{ attribute_type: "shoe_size", attribute_name: "36" }],
      stock_level: 3,
      availability: "Άμεσα Διαθέσιμο",
      availability_message: null,
      status: true,
    },
  ],
  relativeItems: [],
  relativeColours: [],
  size_guide: "",
  breadcrumbs: [
    { path: "/", name: "Αρχική" },
    { path: "/gynaikeia", name: "ΓΥΝΑΙΚΕΙΑ" },
  ],
  cleanUrl: "/gynaikeia/pedila/envie-shoes/platform-heel-mules-mpez",
  created: "2024-02-17T06:05:13+00:00",
  changed: "2026-02-26T15:19:00+00:00",
  metaTags: {
    canonical_url: "https://example.com/product",
    title: "Test Product",
    description: "Test description",
    image_src: "",
    "og:description": "",
    "og:title": "",
    "og:url": "",
    "og:image": "",
    "og:image_secure_url": "",
    "og:image_url": "",
  },
  ga4_category: ["ΓΥΝΑΙΚΕΙΑ", "Πέδιλα"],
  aggregate_rating: null,
  reviews: null,
};

describe("generateProductJsonLd", () => {
  it("generates valid schema.org Product", () => {
    const jsonLd = generateProductJsonLd(mockProduct);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.name).toBe("PLATFORM HEEL MULES");
    expect(jsonLd.sku).toBe("E02-19180-36");
  });

  it("includes brand", () => {
    const jsonLd = generateProductJsonLd(mockProduct);

    expect(jsonLd.brand["@type"]).toBe("Brand");
    expect(jsonLd.brand.name).toBe("Envie Shoes");
  });

  it("calculates AggregateOffer when prices differ", () => {
    const jsonLd = generateProductJsonLd(mockProduct);

    // Prices: 89.9, 89.9, 100 → lowPrice: 89.9, highPrice: 100
    expect(jsonLd.offers["@type"]).toBe("AggregateOffer");
    expect(jsonLd.offers.lowPrice).toBe(89.9);
    expect(jsonLd.offers.highPrice).toBe(100);
    expect(jsonLd.offers.priceCurrency).toBe("EUR");
  });

  it("uses Offer when all prices are the same", () => {
    const samePrice = {
      ...mockProduct,
      variations: mockProduct.variations.map((v) => ({
        ...v,
        price_raw: 89.9,
        stock_level: 5,
      })),
    };

    const jsonLd = generateProductJsonLd(samePrice);
    expect(jsonLd.offers["@type"]).toBe("Offer");
    expect(jsonLd.offers.price).toBe(89.9);
  });

  it("marks as InStock when variations have stock", () => {
    const jsonLd = generateProductJsonLd(mockProduct);
    expect(jsonLd.offers.availability).toBe("https://schema.org/InStock");
  });

  it("marks as OutOfStock when no stock", () => {
    const outOfStock = {
      ...mockProduct,
      variations: mockProduct.variations.map((v) => ({ ...v, stock_level: 0 })),
    };

    const jsonLd = generateProductJsonLd(outOfStock);
    expect(jsonLd.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("includes all product images", () => {
    const jsonLd = generateProductJsonLd(mockProduct);
    expect(jsonLd.image).toHaveLength(2);
    expect(jsonLd.image[0]).toBe("https://example.com/img1.jpg");
  });

  it("includes product details as additionalProperty", () => {
    const jsonLd = generateProductJsonLd(mockProduct);
    expect(jsonLd.additionalProperty).toHaveLength(2);
    expect(jsonLd.additionalProperty[0].name).toBe("Υλικό");
    expect(jsonLd.additionalProperty[0].value).toBe("Συνθετικό Δέρμα");
  });

  it("includes aggregate rating when present", () => {
    const withRating = {
      ...mockProduct,
      aggregate_rating: { ratingValue: 4.5, reviewCount: 12 },
    };

    const jsonLd = generateProductJsonLd(withRating);
    expect(jsonLd.aggregateRating.ratingValue).toBe(4.5);
    expect(jsonLd.aggregateRating.reviewCount).toBe(12);
  });

  it("does not include aggregate rating when null", () => {
    const jsonLd = generateProductJsonLd(mockProduct);
    expect(jsonLd.aggregateRating).toBeUndefined();
  });
});

describe("generateBreadcrumbJsonLd", () => {
  it("generates valid BreadcrumbList", () => {
    const breadcrumbs = [
      { path: "/", name: "Αρχική" },
      { path: "/gynaikeia", name: "ΓΥΝΑΙΚΕΙΑ" },
      { path: "/gynaikeia/pedila", name: "Πέδιλα" },
    ];

    const jsonLd = generateBreadcrumbJsonLd(breadcrumbs);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].name).toBe("Αρχική");
    expect(jsonLd.itemListElement[2].position).toBe(3);
  });

  it("prepends baseUrl to paths", () => {
    const breadcrumbs = [{ path: "/gynaikeia", name: "ΓΥΝΑΙΚΕΙΑ" }];
    const jsonLd = generateBreadcrumbJsonLd(
      breadcrumbs,
      "https://envieshoes.gr",
    );

    expect(jsonLd.itemListElement[0].item).toBe(
      "https://envieshoes.gr/gynaikeia",
    );
  });
});
