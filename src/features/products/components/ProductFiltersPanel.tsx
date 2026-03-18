import { useState, useEffect } from "react";
import type { Category, ProductFilters } from "../model/types";
import styles from "./ProductFiltersPanel.module.scss";

interface ProductFiltersPanelProps {
  categories: Category[];
  filters: ProductFilters;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onSortChange: (sort: ProductFilters["sortBy"]) => void;
  onPriceRange: (min: number, max: number) => void;
  onReset: () => void;
}

/**
 * Filters sidebar / drawer.
 *
 * This is a pure UI component — all state and logic lives in the viewmodel.
 * It receives props and calls action handlers. Nothing else.
 */
export function ProductFiltersPanel({
  categories,
  filters,
  hasActiveFilters,
  onSearchChange,
  onCategoryToggle,
  onSortChange,
  onPriceRange,
  onReset,
}: ProductFiltersPanelProps) {
  // Local debounced search to avoid firing on every keystroke
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onSearchChange(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external filter changes back to local input
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  return (
    <aside className={styles.panel}>
      {/* Search */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Search</h4>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className={styles.searchInput}
        />
      </div>

      {/* Sort */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Sort by</h4>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as ProductFilters["sortBy"])
          }
          className={styles.select}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
        </select>
      </div>

      {/* Categories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categories</h4>
        <ul className={styles.categoryList}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.categoryIds.includes(cat.id)}
                  onChange={() => onCategoryToggle(cat.id)}
                />
                <span>{cat.name}</span>
                <span className={styles.count}>({cat.productCount})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price range</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) =>
              onPriceRange(Number(e.target.value), filters.maxPrice)
            }
            className={styles.priceInput}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              onPriceRange(filters.minPrice, Number(e.target.value))
            }
            className={styles.priceInput}
          />
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button className={styles.resetButton} onClick={onReset}>
          Clear all filters
        </button>
      )}
    </aside>
  );
}
