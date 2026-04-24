import { ProductListViewModel } from "../viewmodel/ProductListViewModel";
import { ProductCard } from "./ProductCard";
import { ProductFiltersPanel } from "./ProductFiltersPanel";
import { Pagination } from "./Pagination";
import type { TaxonomyResponse } from "../model/types";
import styles from "./ProductListSection.module.scss";

interface ProductListSectionProps {
  initialData: TaxonomyResponse;
}

export const ProductListSection = ({
  initialData,
}: ProductListSectionProps) => {
  const vm = ProductListViewModel({ initialData });

  return (
    <div className={styles.container}>
      {/* Category header */}
      {vm.categoryName && (
        <div className={styles.categoryHeader}>
          <h1>{vm.categoryName}</h1>
          {vm.categoryInfo?.description && (
            <div
              className={styles.categoryDescription}
              dangerouslySetInnerHTML={{ __html: vm.categoryInfo.description }}
            />
          )}
        </div>
      )}

      <div className={styles.layout}>
        {/* Filters sidebar */}
        <div className={styles.sidebar}>
          <ProductFiltersPanel facets={vm.facets} />
        </div>

        {/* Product grid */}
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>{vm.totalProducts} προϊόντα</p>

            {vm.sortConfig && (
              <select
                value={vm.sortConfig.selected}
                onChange={(e) => vm.onSortChange(e.target.value)}
                className={styles.sortSelect}
              >
                {vm.sortConfig.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {vm.isLoading && <span className={styles.loading}>Loading…</span>}
          </div>

          {vm.products.length > 0 ? (
            <div className={styles.grid}>
              {vm.products.map((product, index) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  priority={index < 8}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Δεν βρέθηκαν προϊόντα.</p>
            </div>
          )}

          {vm.totalPages > 1 && (
            <Pagination
              currentPage={vm.currentPage}
              totalPages={vm.totalPages}
              onPageChange={vm.onPageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
