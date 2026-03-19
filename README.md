# Next.js E-Commerce Boilerplate

Next.js e-commerce boilerplate with CMS-driven routing, MVVM architecture, and Effector state management.
Built for Drupal-backed e-commerce projects using the Pages Router.

---

## Table of Contents

1. [How the App Works](#how-the-app-works)
2. [Server vs Client — When Each Runs](#server-vs-client)
3. [The Catch-All Slug File — In Depth](#the-catch-all-slug-file)
4. [Project Structure](#project-structure)
5. [Architecture Layers](#architecture-layers)
6. [Cart — Server-Side](#cart--server-side)
7. [SEO — JSON-LD Structured Data](#seo--json-ld-structured-data)
8. [Error Handling](#error-handling)
9. [Adding a New Page Type](#adding-a-new-page-type)
10. [API Endpoints](#api-endpoints)
11. [Testing](#testing)
12. [Getting Started](#getting-started)

---

## How the App Works

This is NOT a traditional Next.js app where the frontend defines routes. The **backend CMS owns the URL structure**. The frontend has a single catch-all page (`[...slug].tsx`) that handles every dynamic URL by asking the backend what it is.

The flow for every page load:

```
User visits: /gynaikeia/sneakers

     Browser
        |
        v
  Next.js Server
        |
        v
  [...slug].tsx → getServerSideProps
        |
        |  Step 1: "What is this path?"
        |  GET /api/v1/router?path=/gynaikeia/sneakers
        |  Backend responds: { type: "taxonomy_term", bundle: "menu_category", id: 1375 }
        |
        |  Step 2: "Which service fetches this type?"
        |  getPageDataByType() switch → fetchProductListingByCategory
        |
        |  Step 3: "Fetch the data"
        |  GET /api/v1/taxonomy/1375
        |  Backend responds: { title: "Sneakers", products: [...], filters: [...] }
        |
        v
  Returns props: { page, pageData, meta }
        |
        v
  CatchAllPage component renders
        |
        |  renderPageByType() switch → <ProductListSection />
        |  getStructuredData() → <JsonLd /> (SEO)
        |
        v
  Full HTML sent to browser (SSR)
        |
        v
  React hydrates (attaches event listeners)
        |
        v
  From here on: client-side interactivity (filters, cart, etc.)
```

Only 3 pages are NOT handled by the catch-all:

- `/` → `pages/index.tsx` (home page)
- `/cart` → `pages/cart.tsx` (shopping cart)
- `/checkout` → `pages/checkout.tsx` (checkout flow)

Everything else — products, categories, blog posts, landing pages, static pages — goes through `[...slug].tsx`.

---

## Server vs Client

Every page load in Next.js has two phases.

### Phase 1: Server (Node.js)

`getServerSideProps` runs on the server BEFORE any HTML is sent to the browser.
This is where route resolution and data fetching happen. The user sees nothing during this phase — the browser is waiting.

What runs here:

- Route resolution (`/api/v1/router`)
- Data fetching (products, categories, blog posts, etc.)
- Meta tag construction (title, description, og:image)
- JSON-LD structured data generation
- All console.log output appears in your **terminal** (where `yarn dev` runs)

What does NOT run here:

- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, document)
- Effector stores
- Event handlers

### Phase 2: Client (Browser)

After the server sends the fully rendered HTML, React "hydrates" it — meaning it attaches event listeners to the existing HTML so it becomes interactive.

What runs here:

- React component rendering and re-rendering
- Effector stores, events, effects
- Viewmodel hooks
- Cart API calls (via Commerce-Cart-Token cookie)
- Everything you see in the browser's Network tab

### When do you see API calls in the Network tab?

| Action                                  | Where it runs                          | Visible in Network tab? |
| --------------------------------------- | -------------------------------------- | ----------------------- |
| First page load (typing URL or refresh) | Server                                 | No                      |
| Clicking a `<Link>` to another page     | Server (via `/_next/data/...` request) | Yes                     |
| Changing filters on product listing     | Client (Effector effect)               | Yes                     |
| Adding item to cart                     | Client (POST /api/v1/cart/add)         | Yes                     |
| Updating cart quantity                  | Client (PATCH /api/v1/cart/...)        | Yes                     |
| Submitting an order                     | Client (API call)                      | Yes                     |

### Debugging

- Server-side errors → check your **terminal** (where `yarn dev` runs)
- Client-side errors → check your **browser DevTools console**
- If an API call is missing from Network tab → it's running on the server

---

## The Catch-All Slug File

`src/pages/[...slug].tsx` is the heart of the app. The routing logic lives in `src/core/api/pageResolver.ts` (extracted for testability), and the slug file imports it.

### Part 1: `getPageDataByType` — "Which service do I call?"

Located in `core/api/pageResolver.ts`. This is a switch statement that maps the backend's route response to the correct service function.

```tsx
const getPageDataByType = (routeData: RouteResolution): PageDataEntry | null => {
  switch (routeData.type) {
    case "commerce_product":
      return { apiGetPageData: fetchProductById, pageType: "product" };

    case "taxonomy_term":
      switch (routeData.bundle) {
        case "blog_categories":
          return { apiGetPageData: fetchBlogListing, pageType: "blog_listing" };
        default:
          return { apiGetPageData: fetchProductListingByCategory, pageType: "product_listing" };
      }

    case "node":
      switch (routeData.bundle) {
        case "landing_page": return { ... , pageType: "landing_page" };
        case "blog":
        case "article":     return { ... , pageType: "blog" };
        case "page":        return { ... , pageType: "basic_page" };
        default: return null;
      }

    default: return null;
  }
};
```

Returns `{ apiGetPageData, pageType }` or `null` (→ 404). Extracted into its own file so it can be unit tested (10 tests cover every route mapping).

### Part 2: `renderPageByType` — "Which component do I render?"

```tsx
const renderPageByType = (pageType: string, pageData: any, page: any) => {
  switch (pageType) {
    case "product":
      return <ProductDetail product={pageData} />;
    case "product_listing":
      return <ProductListSection initialData={pageData} />;
    case "blog":
      return <BlogView post={pageData} />;
    // ...
  }
};
```

### Part 3: `getStructuredData` — "What JSON-LD do I inject?"

```tsx
const getStructuredData = (pageType: string, pageData: any) => {
  switch (pageType) {
    case "product":
      return (
        <>
          <JsonLd data={generateProductJsonLd(pageData)} />
          <JsonLd data={generateBreadcrumbJsonLd(pageData.breadcrumbs)} />
        </>
      );
    case "product_listing":
      return (
        <>
          <JsonLd data={generateProductListingJsonLd(pageData)} />
          <JsonLd data={generateBreadcrumbJsonLd(pageData.breadcrumbs)} />
        </>
      );
    default:
      return null;
  }
};
```

### Part 4: `getServerSideProps` — Server-side data fetching

3 steps: resolve route → find service → fetch data. Handles redirects (301/302), gone pages (410), 404s (null route or null data), and 5xx errors (throws → Next.js renders 500.tsx).

### Props shape

```tsx
{
  page: {
    pageType: "product_listing",
    id: 1375,
    type: "taxonomy_term",
    bundle: "menu_category",
    path: "/gynaikeia/sneakers",
  },
  pageData: { ... },   // TaxonomyResponse, ProductDetailResponse, etc.
  meta: {
    title: "Sneakers — Store",
    description: "...",
    ogImage: null,
  }
}
```

---

## Project Structure

```
src/
├── pages/                                  # Next.js Pages Router
│   ├── _app.tsx                            # App wrapper (layout, ErrorBoundary, cart init)
│   ├── index.tsx                           # Home page
│   ├── [...slug].tsx                       # CMS-driven catch-all (THE router)
│   ├── cart.tsx                            # Cart page (client-only)
│   ├── checkout.tsx                        # Checkout page (client-only)
│   ├── 404.tsx                             # Custom 404 page
│   └── 500.tsx                             # Custom 500 page
│
├── core/                                   # Shared infrastructure
│   ├── api/
│   │   ├── apiClient.ts                    # Axios instance with optional auth
│   │   ├── endpoints.ts                    # ALL API endpoint URLs in one place
│   │   ├── routerService.ts                # resolveRoute() — calls backend router
│   │   ├── routerModel.ts                  # RouteResolution type
│   │   └── pageResolver.ts                 # getPageDataByType() — route → service mapping
│   ├── model/
│   │   └── commonTypes.ts                  # Shared types (ProductImage, Breadcrumb, MetaTags)
│   ├── seo/
│   │   ├── JsonLd.tsx                      # <JsonLd> component (renders script tag)
│   │   └── structuredData.ts               # JSON-LD generators (Product, CollectionPage, etc.)
│   ├── hooks/
│   │   └── useScrollRestoration.ts         # Back-navigation scroll restoration
│   ├── layouts/
│   │   ├── MainLayout.tsx                  # Header, footer, cart badge
│   │   └── MainLayout.module.scss
│   ├── lib/
│   │   ├── formatters.ts                   # formatPrice, slugify, truncate
│   │   ├── queryParams.ts                  # URL query parsing and syncing
│   │   └── cartToken.ts                    # Commerce-Cart-Token cookie (UUID v4)
│   └── ui/
│       ├── ErrorBoundary.tsx               # Client-side error boundary
│       ├── PageGone.tsx                    # 410 "page removed" component
│       └── PageGone.module.scss
│
├── features/                               # Feature-folder architecture
│   ├── product/                            # Product detail page
│   │   ├── model/types.ts                  # ProductDetailResponse, ProductVariation, etc.
│   │   ├── service/productService.ts       # fetchProductById
│   │   ├── viewmodel/useProductDetailViewModel.ts
│   │   └── components/
│   │       ├── ProductDetail.tsx
│   │       └── ProductDetail.module.scss
│   │
│   ├── product-listing/                    # Category / product listing page
│   │   ├── model/types.ts                  # TaxonomyResponse, ProductListingItem, Facet, etc.
│   │   ├── service/productListingService.ts  # fetchProductListingByCategory
│   │   ├── store/productListingStore.ts    # Effector stores ($products, $facets, $pager, etc.)
│   │   ├── viewmodel/useProductListViewModel.ts
│   │   └── components/
│   │       ├── ProductCard.tsx
│   │       ├── ProductFiltersPanel.tsx
│   │       ├── ProductListSection.tsx
│   │       └── Pagination.tsx
│   │
│   ├── cart/                               # Server-side cart (API-driven)
│   │   ├── model/types.ts                  # CartResponse, CartOrderItem, AddToCartPayload
│   │   ├── service/cartService.ts          # fetchCart, addToCart, updateQuantity, remove, clear
│   │   ├── store/cartStore.ts              # $cart, $cartItems, $cartItemCount, effects
│   │   ├── viewmodel/useCartViewModel.ts
│   │   └── components/
│   │       ├── CartSection.tsx
│   │       └── CartSection.module.scss
│   │
│   ├── checkout/
│   │   ├── model/types.ts
│   │   ├── service/checkoutService.ts
│   │   ├── store/checkoutStore.ts
│   │   ├── viewmodel/useCheckoutViewModel.ts
│   │   └── components/
│   │       ├── CheckoutSection.tsx
│   │       └── CheckoutSection.module.scss
│   │
│   ├── blog/
│   │   ├── model/types.ts
│   │   ├── service/blogService.ts
│   │   └── components/BlogComponents.tsx
│   │
│   ├── basic-page/
│   │   ├── model/types.ts
│   │   ├── service/basicPageService.ts
│   │   └── components/BasicPageView.tsx
│   │
│   └── landing/
│       ├── model/types.ts
│       ├── service/landingService.ts
│       └── components/LandingPageView.tsx
│
└── styles/
    └── globals.scss
```

### Import Rules

- No barrel files (no `index.ts` re-exports). Every import points directly to the actual file.
- `@/core/...` for shared infrastructure
- `@/features/...` for feature code
- Relative imports (`../model/types`) within the same feature

---

## Architecture Layers

Each feature follows the same folder pattern. Not every feature uses every layer — simpler features (blog, basic-page, landing) skip the store and viewmodel layers.

### model/types.ts — Data types

TypeScript interfaces typed from **real API responses**. The product and product-listing types were built from actual Envie backend data, not guessed.

### service/\*Service.ts — API calls

Pure async functions. No hooks, no stores, no browser APIs. This is critical because services are called from BOTH:

- `getServerSideProps` on the server (initial page load)
- Effector effects on the client (user interactions like filter changes)

All endpoint URLs come from `core/api/endpoints.ts` — one file for every API path in the project.

### store/\*Store.ts — Effector state management

Effector stores, events, and effects. Client-side only. Handles reactive state that needs to survive across component re-renders (filters, cart items, checkout form state).

In Next.js, stores don't need meaningful initial values because SSR already rendered the page before stores are populated. Stores are hydrated from SSR props after hydration, then take over for client-side interactions.

### viewmodel/use\*ViewModel.ts — MVVM bridge

Custom hooks that bridge SSR data with Effector stores. The viewmodel:

1. Receives SSR data from props
2. Hydrates Effector stores on mount
3. Syncs URL query params with store state (bidirectional)
4. Exposes state + action handlers to components

Components never touch stores directly — they use the viewmodel.

### components/\*.tsx — UI

Pure rendering. Receives data from the viewmodel (or directly from props for SSR-only pages), renders HTML, calls action handlers. Zero business logic.

---

## Cart — Server-Side

The cart is fully server-side — the backend manages cart state, the frontend makes API calls for every action. No localStorage.

### How it works

The anonymous user is identified by a `Commerce-Cart-Token` — a UUID v4 generated by the frontend on first visit and stored in a cookie. Every cart API call includes this token as a header.

```
User visits site for the first time
  → getCartToken() generates UUID → stored in cookie (500 days)
  → GET /api/v1/cart (Commerce-Cart-Token: abc-123) → empty cart or null

User adds item
  → POST /api/v1/cart/add (Commerce-Cart-Token: abc-123, body: [{ variation_id, quantity }])
  → Response: full updated cart (order_items, totals, adjustments)

User updates quantity
  → PATCH /api/v1/cart/{order_id}/items/{order_item_id} (body: { quantity })
  → Response: full updated cart

User removes item
  → DELETE /api/v1/cart/{order_id}/items/{order_item_id}
  → Response: full updated cart

User clears cart
  → DELETE /api/v1/cart/{order_id}/items
  → Response: 204 (no body)
```

Every mutation returns the full updated cart — the store always replaces, never merges.

### Store architecture

```tsx
$cart (CartResponse | null)           ← full API response, replaced on every mutation
├── $cartItems                        ← $cart.order_items
├── $cartItemCount                    ← sum of quantities
├── $cartOrderId                      ← $cart.order_id
├── $isCartEmpty                      ← items.length === 0
├── $cartSubtotal                     ← $cart.sub_total_price
├── $cartTotal                        ← $cart.total_price
├── $cartAdjustments                  ← $cart.adjustments (tax, etc.)
└── $cartCoupons                      ← $cart.coupons
```

### Initialization

`_app.tsx` calls `initCart()` on mount → `fetchCartFx()` → fetches cart from backend. If no cart exists for this token, `$cart` stays null.

---

## SEO — JSON-LD Structured Data

The project generates `schema.org` structured data for Google rich snippets. This is what makes products show up in Google with prices, star ratings, and "In Stock" labels.

Generated in `core/seo/structuredData.ts`, rendered via `<JsonLd>` component inside `<Head>`:

**Product detail page** gets:

- `schema.org/Product` — title, brand, images, SKU, color, availability
- `schema.org/Offer` or `schema.org/AggregateOffer` — price (or price range if sizes differ)
- `schema.org/AggregateRating` + `schema.org/Review` — if present
- `additionalProperty` — product specs (material, heel height, collection, etc.)
- `schema.org/BreadcrumbList`

**Product listing page** gets:

- `schema.org/CollectionPage` with `schema.org/ItemList`
- Each product as a `ListItem` with name, image, brand, price, availability
- `schema.org/BreadcrumbList`

Verify output: visit a product page → View Source → search for `application/ld+json`, or paste the URL into [Google's Rich Results Test](https://search.google.com/test/rich-results).

---

## Error Handling

### Server-side (getServerSideProps)

| Error                                | What happens                     |
| ------------------------------------ | -------------------------------- |
| Path not found (router returns null) | `{ notFound: true }` → 404.tsx   |
| Data not found (API 404)             | `{ notFound: true }` → 404.tsx   |
| Backend down (5xx)                   | Throws → Next.js renders 500.tsx |
| Network error                        | Throws → Next.js renders 500.tsx |
| Page gone (410)                      | Renders `<PageGone />` component |
| Unmapped type+bundle                 | `{ notFound: true }` → 404.tsx   |

`routerService.ts` returns `null` for 404 and **throws** for 5xx — so server errors show the 500 page, not a misleading 404.

### Client-side

`_app.tsx` wraps all page components in `<ErrorBoundary>`. If a component throws during rendering, the user sees a "Try again" button instead of a white screen. In development, the full error stack is shown.

---

## Adding a New Page Type

Example: adding a FAQ page type.

### Step 1: Create the feature

```
src/features/faq/
  model/types.ts        — FaqPage, FaqItem interfaces
  service/faqService.ts — fetchFaqPage(id)
  components/FaqView.tsx — the component
```

### Step 2: Add the endpoint

In `core/api/endpoints.ts`:

```tsx
export const FAQ_ENDPOINT = "/api/v1/faq";
```

### Step 3: Add to pageResolver

In `core/api/pageResolver.ts`, add one case:

```tsx
case "node":
  switch (routeData.bundle) {
    case "faq":
      return { apiGetPageData: fetchFaqPage, pageType: "faq" };
    // ... existing cases
  }
```

### Step 4: Add to renderPageByType

In `[...slug].tsx`:

```tsx
case "faq":
  return <FaqView data={pageData} />;
```

Four touches: feature folder, endpoint, one pageResolver case, one render case.

---

## API Endpoints

All endpoints are defined in `src/core/api/endpoints.ts`.

| Endpoint                         | Method | Purpose                                     |
| -------------------------------- | ------ | ------------------------------------------- |
| `/api/v1/router?path=...`        | GET    | Route resolution — returns entity type + ID |
| `/api/v1/products/{pid}`         | GET    | Single product by ID                        |
| `/api/v1/taxonomy/{tid}`         | GET    | Product listing by category ID              |
| `/api/v1/search`                 | GET    | Product search                              |
| `/api/v1/homepage`               | GET    | Home page data                              |
| `/api/v1/blog`                   | GET    | Blog listing                                |
| `/api/v1/blog/{id}`              | GET    | Single blog post                            |
| `/api/v1/pages/{id}`             | GET    | Basic CMS page                              |
| `/api/v1/landing/{id}`           | GET    | Landing page with sections                  |
| `/api/v1/cart`                   | GET    | Fetch current cart                          |
| `/api/v1/cart/add`               | POST   | Add item(s) to cart                         |
| `/api/v1/cart/{oid}/items/{iid}` | PATCH  | Update item quantity                        |
| `/api/v1/cart/{oid}/items/{iid}` | DELETE | Remove single item                          |
| `/api/v1/cart/{oid}/items`       | DELETE | Clear entire cart                           |
| `/api/v1/orders`                 | POST   | Submit order                                |
| `/oauth/token`                   | POST   | User login (password grant)                 |

All cart endpoints require `Commerce-Cart-Token` header (UUID v4, stored in cookie).

---

## Testing

```bash
yarn test          # Watch mode — re-runs on file changes
yarn test --run    # Run once (CI)
```

### What We Test and Why

Tests live next to the files they test (co-located), not in a separate `__tests__/` folder. When you open a feature folder you immediately see if it has tests, and when you delete a feature the tests go with it.

```
core/
  lib/formatters.test.ts
  lib/cartToken.test.ts
  api/pageResolver.test.ts
  seo/structuredData.test.ts
features/
  cart/store/cartStore.test.ts
```

### Test Files

**`pageResolver.test.ts`** (10 tests) — Route resolution logic. When the backend says "this URL is a `commerce_product`", does our code pick `fetchProductById`? When it says `taxonomy_term` with `blog_categories`, does it pick `fetchBlogListing`? When it says something unknown, does it return `null` (404)?

This is the most important test in the project. Every single page goes through `getPageDataByType`. If this function maps a type to the wrong service, entire page categories break silently.

**`cartStore.test.ts`** (15 tests) — Cart store reactions and derived stores. Does `$cart` populate when `fetchCartFx` succeeds? Does `$cartItemCount` correctly sum quantities across items? Does `clearCartFx` reset everything to `null`? Is `$cartIsMutating` true while effects are pending?

Uses Effector's `fork()` API to create isolated store scopes per test — no state leaks between tests.

**`structuredData.test.ts`** (12 tests) — JSON-LD structured data generators. Does `generateProductJsonLd` output valid `schema.org/Product`? Does it calculate `AggregateOffer` when sizes have different prices, and plain `Offer` when they're the same? Does it mark out-of-stock products correctly? Does it omit `aggregateRating` when there are no reviews?

**`formatters.test.ts`** (11 tests) — Pure utility functions: `formatPrice`, `slugify`, `truncate`. Focuses on edge cases — zero values, empty strings, exact-length strings — because that's where bugs hide.

**`cartToken.test.ts`** (3 tests) — Cart token cookie management. Does `getCartToken()` generate a valid UUID v4? Does it return the same token on subsequent calls? Does `clearCartToken()` actually clear it?

### What We Don't Test (and Why)

**Components** — They render what the store/viewmodel gives them. If the store is correct, the component works. Component tests are also brittle.

**Services** — Thin wrappers around `apiClient.get()`. Testing them means mocking Axios, which tests Axios, not our code.

**Viewmodels** — Mostly wiring between stores and components. The interesting logic is in the stores, which we already test.

### Decision Framework

1. "If this breaks, does the whole app break?" → Test it. (pageResolver)
2. "Does this involve money or data integrity?" → Test it. (cartStore)
3. "Is this invisible but important?" → Test it. (structuredData, cartToken)
4. "Is this a pure function used in many places?" → Test it. (formatters)
5. "Is this just displaying data someone else computed?" → Skip. (components)
6. "Is this just calling a third-party library?" → Skip. (services wrapping Axios)

---

## Getting Started

```bash
# Create Next.js project (say NO to App Router, YES to src/ directory)
yarn create next-app@latest my-app

# Install dependencies
cd my-app
yarn add effector effector-react axios react-hook-form sass clsx uuid
yarn add -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/uuid

# Replace src/ with this boilerplate
rm -rf src
# copy this boilerplate's src/ folder

# Configure environment
cp .env.example .env.local
# fill in your API URL and credentials

# Run
yarn dev

# Test
yarn test
```

### Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend.example.com
NEXT_PUBLIC_CLIENT_ID=your-oauth-client-id
NEXT_PUBLIC_CLIENT_SECRET=your-oauth-client-secret
```

---

## Tech Stack

- **Next.js** (Pages Router) — SSR + client-side navigation
- **TypeScript** — type safety, real API response types
- **Effector** — state management (stores, events, effects)
- **Vitest** — unit testing with Effector fork() isolation
- **Axios** — API client with auth interceptor
- **SCSS Modules** — component-scoped styling
- **uuid** — Commerce-Cart-Token generation
