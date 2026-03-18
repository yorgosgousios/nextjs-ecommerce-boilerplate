import { useProductListViewModel } from "../viewmodel/useProductListViewModel";
import { ProductCard } from "./ProductCard";
import { ProductFiltersPanel } from "./ProductFiltersPanel";
import { Pagination } from "./Pagination";
import type { ProductListResponse, Category } from "../model/types";
import styles from "./ProductListSection.module.scss";

interface ProductListSectionProps {
  initialProducts: ProductListResponse;
  initialCategories: Category[];
}

/**
 * ProductListSection is the "View" in MVVM.
 *
 * It connects to the viewmodel hook, which provides all state and actions.
 * This component's only job is rendering — zero business logic.
 */
export function ProductListSection({
  initialProducts,
  initialCategories,
}: ProductListSectionProps) {
  const vm = useProductListViewModel({ initialProducts, initialCategories });

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ProductFiltersPanel
          categories={vm.categories}
          filters={vm.filters}
          hasActiveFilters={vm.hasActiveFilters}
          onSearchChange={vm.onSearchChange}
          onCategoryToggle={vm.onCategoryToggle}
          onSortChange={vm.onSortChange}
          onPriceRange={vm.onPriceRange}
          onReset={vm.onReset}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.resultCount}>
            {vm.totalProducts} product{vm.totalProducts !== 1 && "s"}
          </p>
          {vm.isLoading && <span className={styles.loading}>Loading…</span>}
        </div>

        {vm.products.length > 0 ? (
          <div className={styles.grid}>
            {vm.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No products found.</p>
            {vm.hasActiveFilters && (
              <button onClick={vm.onReset} className={styles.clearButton}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {vm.totalPages > 1 && (
          <Pagination
            currentPage={vm.filters.page}
            totalPages={vm.totalPages}
            onPageChange={vm.onPageChange}
          />
        )}
      </div>
    </div>
  );
}
