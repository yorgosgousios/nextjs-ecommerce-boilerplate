import Link from "next/link";
import Image from "next/image";
import type { Product } from "../model/types";
import { formatPrice } from "@/core/lib/formatters";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOnSale =
    product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={styles.image}
          />
        )}
        {isOnSale && <span className={styles.saleBadge}>Sale</span>}
        {!product.inStock && (
          <span className={styles.outOfStock}>Out of Stock</span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.category}>{product.categoryName}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.prices}>
          {isOnSale && (
            <span className={styles.originalPrice}>
              {formatPrice(product.price)}
            </span>
          )}
          <span className={styles.price}>
            {formatPrice(product.salePrice ?? product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
