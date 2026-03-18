import { useState } from "react";
import type { Facet } from "../model/types";
import styles from "./ProductFiltersPanel.module.scss";

interface ProductFiltersPanelProps {
  facets: Facet[];
  onFilterChange?: (facet: string, value: string) => void;
  onReset?: () => void;
}

export const ProductFiltersPanel = ({
  facets,
  onFilterChange,
  onReset,
}: ProductFiltersPanelProps) => {
  const [openFacets, setOpenFacets] = useState<Record<string, boolean>>({});

  const toggleFacet = (facetKey: string) => {
    setOpenFacets((prev) => ({
      ...prev,
      [facetKey]: !prev[facetKey],
    }));
  };

  return (
    <aside className={styles.panel}>
      {facets.map((facet) => (
        <div key={facet.facet} className={styles.section}>
          <button
            className={styles.sectionTitle}
            onClick={() => toggleFacet(facet.facet)}
          >
            <span>{facet.name}</span>
            <span className={styles.arrow}>
              {openFacets[facet.facet] ? "−" : "+"}
            </span>
          </button>

          {openFacets[facet.facet] && (
            <ul className={styles.filterList}>
              {facet.filters.map((filter) => (
                <li key={filter.filter_transliterated}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      onChange={() =>
                        onFilterChange?.(
                          facet.facet,
                          filter.filter_transliterated,
                        )
                      }
                    />
                    <span>{filter.filter}</span>
                    <span className={styles.count}>({filter.count})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {onReset && (
        <button className={styles.resetButton} onClick={onReset}>
          Καθαρισμός φίλτρων
        </button>
      )}
    </aside>
  );
};
