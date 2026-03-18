import Image from "next/image";
import { useProductDetailViewModel } from "../viewmodel/useProductDetailViewModel";
import { formatPrice } from "@/core/lib/formatters";
import type { Product } from "../model/types";
import styles from "./ProductDetail.module.scss";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const vm = useProductDetailViewModel({ product });

  return (
    <div className={styles.container}>
      {/* Image gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {vm.currentImage && (
            <Image
              src={vm.currentImage}
              alt={vm.product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
              priority
            />
          )}
        </div>
        {vm.product.images.length > 1 && (
          <div className={styles.thumbnails}>
            {vm.product.images.map((img, idx) => (
              <button
                key={idx}
                className={`${styles.thumbnail} ${
                  idx === vm.selectedImageIndex ? styles.thumbnailActive : ""
                }`}
                onClick={() => vm.onImageSelect(idx)}
              >
                <Image src={img} alt="" fill sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className={styles.info}>
        <p className={styles.category}>{vm.product.categoryName}</p>
        <h1 className={styles.name}>{vm.product.name}</h1>

        <div className={styles.pricing}>
          {vm.isOnSale && (
            <span className={styles.originalPrice}>
              {formatPrice(vm.product.price)}
            </span>
          )}
          <span className={styles.price}>
            {formatPrice(vm.effectivePrice)}
          </span>
        </div>

        <p className={styles.description}>{vm.product.description}</p>

        {/* Attributes */}
        {vm.product.attributes.length > 0 && (
          <div className={styles.attributes}>
            {vm.product.attributes.map((attr) => (
              <div key={attr.name} className={styles.attribute}>
                <span className={styles.attrName}>{attr.name}:</span>
                <span>{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quantity + Add to cart */}
        <div className={styles.actions}>
          <div className={styles.quantity}>
            <button onClick={() => vm.onQuantityChange(vm.quantity - 1)}>
              −
            </button>
            <span>{vm.quantity}</span>
            <button onClick={() => vm.onQuantityChange(vm.quantity + 1)}>
              +
            </button>
          </div>

          <button
            className={styles.addToCart}
            onClick={vm.onAddToCart}
            disabled={!vm.product.inStock}
          >
            {vm.addedToCart
              ? "✓ Added!"
              : vm.product.inStock
              ? "Add to Cart"
              : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
