import Link from "next/link";
import Image from "next/image";
import type { ProductListingItem } from "../model/types";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: ProductListingItem;
  /** Mark as true for first 4-8 cards (above the fold) to preload images */
  priority?: boolean;
}

export const ProductCard = ({
  product,
  priority = false,
}: ProductCardProps) => {
  const isOnSale = product.discount_percentage !== null;

  return (
    <Link href={product.cleanUrl} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.image[0] && (
          <Image
            src={product.image[0].url}
            alt={product.image[0].alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.image}
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        )}
        {product.tag_label && (
          <span className={styles.tagBadge}>{product.tag_label}</span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <h3 className={styles.name}>{product.title}</h3>
        <p className={styles.color}>{product.color_name}</p>
        <div className={styles.prices}>
          {isOnSale && product.list_price && (
            <span className={styles.originalPrice}>{product.list_price}</span>
          )}
          <span className={styles.price}>{product.price}</span>
          {product.discount_percentage && (
            <span className={styles.discount}>
              {product.discount_percentage}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
