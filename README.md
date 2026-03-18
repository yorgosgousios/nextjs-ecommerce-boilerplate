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
6. [Adding a New Page Type](#adding-a-new-page-type)
7. [API Endpoints](#api-endpoints)
8. [Getting Started](#getting-started)

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
        |  renderPageByType() switch → <ProductListView />
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
- localStorage (cart persistence)
- Everything you see in the browser's Network tab

### When do you see API calls in the Network tab?

| Action                                  | Where it runs                          | Visible in Network tab? |
| --------------------------------------- | -------------------------------------- | ----------------------- |
| First page load (typing URL or refresh) | Server                                 | No                      |
| Clicking a `<Link>` to another page     | Server (via `/_next/data/...` request) | Yes                     |
| Changing filters on product listing     | Client (Effector effect)               | Yes                     |
| Adding item to cart                     | Client (localStorage)                  | No                      |
| Validating cart before checkout         | Client (API call)                      | Yes                     |
| Submitting an order                     | Client (API call)                      | Yes                     |

### Debugging

- Server-side errors → check your **terminal** (where `yarn dev` runs)
- Client-side errors → check your **browser DevTools console**
- If an API call is missing from Network tab → it's running on the server

---

## The Catch-All Slug File

`src/pages/[...slug].tsx` is the heart of the app. It has 4 parts:

### Part 1: `getPageDataByType` — "Which service do I call?"

This is a switch statement that maps the backend's route response to the correct service function. When the backend says "this path is a `commerce_product`", this function returns `fetchProductById`. When it says "this is a `taxonomy_term`", it returns `fetchProductListingByCategory`.

```tsx
const getPageDataByType = (
  routeData: RouteResolution,
): PageDataEntry | null => {
  switch (routeData.type) {
    case "commerce_product":
      return { apiGetPageData: fetchProductById, pageType: "product" };

    case "taxonomy_term":
      switch (routeData.bundle) {
        case "blog_categories":
          return { apiGetPageData: fetchBlogListing, pageType: "blog_listing" };
        default:
          return {
            apiGetPageData: fetchProductListingByCategory,
            pageType: "product_listing",
          };
      }

    case "node":
      switch (routeData.bundle) {
        case "landing_page":
          return { apiGetPageData: fetchLandingPage, pageType: "landing_page" };
        case "blog":
        case "article":
          return { apiGetPageData: fetchBlogPost, pageType: "blog" };
        case "page":
          return { apiGetPageData: fetchBasicPage, pageType: "basic_page" };
        default:
          return null;
      }

    default:
      return null;
  }
};
```

It returns TWO things:

- `apiGetPageData` — the function to call (e.g., `fetchProductById`)
- `pageType` — a string used later by `renderPageByType` to pick the right component

If it returns `null`, the page is a 404.

### Part 2: `renderPageByType` — "Which component do I render?"

This is the React-side switch that picks the right component based on the `pageType` string from step 1.

```tsx
const renderPageByType = (pageType: string, pageData: any, page: any) => {
  switch (pageType) {
    case "product":
      return <ProductDetail product={pageData} />;
    case "product_listing":
      return <ProductListView {...pageData} page={page} />;
    case "blog":
      return <BlogView post={pageData} />;
    // ...
  }
};
```

Every component receives `pageData` (the raw API response) and `page` (route metadata like id, type, bundle, path).

### Part 3: `CatchAllPage` — The React component

This is minimal. It destructures props, renders SEO meta tags in `<Head>`, and calls `renderPageByType`.

```tsx
const CatchAllPage = (props) => {
  const { page, pageData, meta } = props;

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        ...
      </Head>
      {renderPageByType(page.pageType, pageData, page)}
    </>
  );
};
```

### Part 4: `getServerSideProps` — Server-side data fetching

This is the function that Next.js calls on the server before rendering. It has 3 steps:

**Step 1: Resolve the route**

```
GET /api/v1/router?path=/gynaikeia/sneakers
→ { type: "taxonomy_term", bundle: "menu_category", id: 1375 }
```

Also handles:

- `null` response → 404 page
- `status: 301/302` → redirect
- `status: 410` → "page gone" component

**Step 2: Find the service function**

```
getPageDataByType(routeData)
→ { apiGetPageData: fetchProductListingByCategory, pageType: "product_listing" }
```

If no service is mapped for this type+bundle → 404 page.

**Step 3: Fetch the data**

```
await entry.apiGetPageData(routeData.id, 0)
→ { title: "Sneakers", products: [...], ... }
```

Then constructs `{ page, pageData, meta }` and returns it as props.

### Props shape

Every page receives the same props structure:

```tsx
{
  page: {
    pageType: "product_listing",  // used by renderPageByType
    id: 1375,                     // CMS entity ID
    type: "taxonomy_term",        // from backend router
    bundle: "menu_category",      // from backend router
    path: "/gynaikeia/sneakers",  // resolved path
  },
  pageData: { ... },              // raw API response (shape varies per page type)
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
├── pages/                              # Next.js Pages Router
│   ├── _app.tsx                        # App wrapper (layout, cart init, scroll restoration)
│   ├── index.tsx                       # Home page (SSR)
│   ├── [...slug].tsx                   # CMS-driven catch-all (THE router)
│   ├── cart.tsx                        # Cart page (client-only)
│   ├── checkout.tsx                    # Checkout page (client-only)
│   └── 404.tsx                         # Custom 404 page
│
├── core/                               # Shared infrastructure (used by all features)
│   ├── api/
│   │   ├── apiClient.ts                # Axios instance with optional auth
│   │   ├── endpoints.ts                # ALL API endpoint URLs in one place
│   │   ├── routerService.ts            # resolveRoute() — calls backend router
│   │   └── routerModel.ts             # RouteResolution type
│   ├── hooks/
│   │   └── useScrollRestoration.ts     # Back-navigation scroll restoration
│   ├── layouts/
│   │   ├── MainLayout.tsx              # Header, footer, cart badge
│   │   └── MainLayout.module.scss
│   ├── lib/
│   │   ├── formatters.ts              # formatPrice, slugify, truncate
│   │   └── queryParams.ts            # URL query parsing and syncing
│   └── ui/
│       ├── PageGone.tsx               # 410 "page removed" component
│       └── PageGone.module.scss
│
├── features/                           # Feature-folder architecture
│   ├── products/
│   │   ├── model/types.ts             # Product, ProductFilters, Category types
│   │   ├── service/productsService.ts # API calls: fetchProducts, fetchProductById, etc.
│   │   ├── store/productsStore.ts     # Effector stores, events, effects
│   │   ├── viewmodel/
│   │   │   ├── useProductListViewModel.ts    # SSR hydration + filter sync
│   │   │   └── useProductDetailViewModel.ts  # Image gallery, add to cart
│   │   └── components/
│   │       ├── ProductCard.tsx
│   │       ├── ProductDetail.tsx
│   │       ├── ProductListSection.tsx
│   │       ├── ProductFiltersPanel.tsx
│   │       └── Pagination.tsx
│   │
│   ├── cart/
│   │   ├── model/types.ts             # CartItem, AddToCartPayload
│   │   ├── service/cartService.ts     # validateCart, fetchShippingMethods
│   │   ├── store/cartStore.ts         # localStorage persistence + cross-tab sync
│   │   ├── viewmodel/useCartViewModel.ts
│   │   └── components/CartSection.tsx
│   │
│   ├── checkout/
│   │   ├── model/types.ts             # CheckoutFormData, CheckoutStep
│   │   ├── service/checkoutService.ts # submitOrder, fetchAddressConfig
│   │   ├── store/checkoutStore.ts     # Multi-step flow state
│   │   ├── viewmodel/useCheckoutViewModel.ts
│   │   └── components/CheckoutSection.tsx
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
    └── globals.scss                    # Global reset and base styles
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

TypeScript interfaces and types. No runtime code. Shared between all other layers.

### service/\*Service.ts — API calls

Pure async functions. No hooks, no stores, no browser APIs. This is critical because services are called from BOTH:

- `getServerSideProps` on the server (initial page load)
- Effector effects on the client (user interactions like filter changes)

```tsx
// This exact function runs on the server AND the client
export const fetchProductListingByCategory = async (
  categoryId: number,
  page = 0,
) => {
  const { data } = await apiClient.get(`${TAXONOMY_ENDPOINT}/${categoryId}`, {
    params: { page },
  });
  return data;
};
```

All endpoint URLs come from `core/api/endpoints.ts` — one file for every API path in the project.

### store/\*Store.ts — Effector state management

Effector stores, events, and effects. Client-side only. Handles reactive state that needs to survive across component re-renders (filters, cart items, checkout form state).

The key Effector pattern used:

```tsx
// Event → Store update
const filtersChanged = createEvent<Partial<ProductFilters>>();
const $filters = createStore(defaultFilters).on(
  filtersChanged,
  (state, payload) => ({ ...state, ...payload }),
);

// Store change → Side effect (API call)
sample({
  clock: filtersChanged,
  source: $filters,
  target: fetchProductsFx,
});
```

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

### Step 3: Add to the slug file

In `[...slug].tsx`, add one case to each switch:

```tsx
// In getPageDataByType:
case "node":
  switch (routeData.bundle) {
    case "faq":
      return { apiGetPageData: fetchFaqPage, pageType: "faq" };
    // ... existing cases
  }

// In renderPageByType:
case "faq":
  return <FaqView data={pageData} />;
```

That's it. Three touches: feature folder, endpoint, two switch cases.

---

## API Endpoints

All endpoints are defined in `src/core/api/endpoints.ts`.

| Endpoint                  | Method | Purpose                                     |
| ------------------------- | ------ | ------------------------------------------- |
| `/api/v1/router?path=...` | GET    | Route resolution — returns entity type + ID |
| `/api/v1/products/{pid}`  | GET    | Single product by ID                        |
| `/api/v1/taxonomy/{tid}`  | GET    | Product listing by category ID              |
| `/api/v1/search`          | GET    | Product search                              |
| `/api/v1/homepage`        | GET    | Home page data                              |
| `/api/v1/blog`            | GET    | Blog listing                                |
| `/api/v1/blog/{id}`       | GET    | Single blog post                            |
| `/api/v1/pages/{id}`      | GET    | Basic CMS page                              |
| `/api/v1/landing/{id}`    | GET    | Landing page with sections                  |
| `/api/v1/cart/validate`   | POST   | Validate cart items (stock + price)         |
| `/api/v1/orders`          | POST   | Submit order                                |
| `/oauth/token`            | POST   | User login (password grant)                 |

---

## Getting Started

```bash
# Create Next.js project (say NO to App Router, YES to src/ directory)
yarn create next-app@latest my-app

# Install dependencies
cd my-app
yarn add effector effector-react axios react-hook-form sass clsx

# Replace src/ with this boilerplate
rm -rf src
# copy this boilerplate's src/ folder

# Configure environment
cp .env.example .env.local
# fill in your API URL and credentials

# Run
yarn dev
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
- **TypeScript** — type safety
- **Effector** — state management (stores, events, effects)
- **React Hook Form** — checkout forms
- **Axios** — API client with auth interceptor
- **SCSS Modules** — component-scoped styling
