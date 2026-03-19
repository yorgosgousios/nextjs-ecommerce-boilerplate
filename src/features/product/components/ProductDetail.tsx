import Image from "next/image";
import Link from "next/link";
import { ProductDetailViewModel } from "../viewmodel/ProductDetailViewModel";
import type { ProductDetailResponse } from "../model/types";
import styles from "./ProductDetail.module.scss";

interface ProductDetailProps {
  product: ProductDetailResponse;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const vm = ProductDetailViewModel({ product });

  return (
    <div className={styles.container}>
      {/* Image gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {vm.currentImage && (
            <Image
              src={vm.currentImage.url}
              alt={vm.currentImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
              priority
            />
          )}
        </div>
        {vm.product.productMedia.length > 1 && (
          <div className={styles.thumbnails}>
            {vm.product.productMedia.map((media, idx) => (
              <button
                key={idx}
                className={`${styles.thumbnail} ${
                  idx === vm.selectedImageIndex ? styles.thumbnailActive : ""
                }`}
                onClick={() => vm.onImageSelect(idx)}
              >
                <Image
                  src={media.url}
                  alt={media.alt}
                  fill
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className={styles.info}>
        {/* Brand */}
        <Link href={vm.product.brand.cleanUrl} className={styles.brand}>
          {vm.product.brand.name}
        </Link>

        <h1 className={styles.name}>{vm.product.title}</h1>
        <p className={styles.color}>{vm.product.color_name}</p>

        {/* Pricing */}
        <div className={styles.pricing}>
          {vm.isOnSale && vm.selectedVariation.list_price && (
            <span className={styles.originalPrice}>
              {vm.selectedVariation.list_price}
            </span>
          )}
          <span className={styles.price}>{vm.selectedVariation.price}</span>
          {vm.selectedVariation.discount_percentage && (
            <span className={styles.discount}>
              {vm.selectedVariation.discount_percentage}
            </span>
          )}
        </div>

        {/* Tag */}
        {vm.product.tag_label && (
          <span className={styles.tag}>{vm.product.tag_label}</span>
        )}

        {/* Size selector */}
        <div className={styles.sizes}>
          <h4>Μέγεθος</h4>
          <div className={styles.sizeGrid}>
            {vm.availableVariations.map((variation) => (
              <button
                key={variation.id}
                className={`${styles.sizeButton} ${
                  variation.id === vm.selectedVariation.id
                    ? styles.sizeActive
                    : ""
                } ${variation.stock_level === 0 ? styles.sizeDisabled : ""}`}
                onClick={() => vm.onVariationSelect(variation.id)}
                disabled={variation.stock_level === 0}
              >
                {variation.name}
              </button>
            ))}
          </div>
        </div>

        {/* Colour variants */}
        {vm.product.relativeColours.length > 0 && (
          <div className={styles.colours}>
            <h4>Χρώματα</h4>
            <div className={styles.colourGrid}>
              {vm.product.relativeColours.map((colour) => (
                <Link
                  key={colour.product_id}
                  href={colour.cleanUrl}
                  className={styles.colourThumb}
                >
                  {colour.image[0] && (
                    <Image
                      src={colour.image[0].url}
                      alt={colour.image[0].alt}
                      fill
                      sizes="48px"
                    />
                  )}
                </Link>
              ))}
            </div>
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
            disabled={!vm.isInStock}
          >
            {vm.addedToCart
              ? "✓ Προστέθηκε!"
              : vm.isInStock
                ? "Προσθήκη στο καλάθι"
                : "Εξαντλημένο"}
          </button>
        </div>

        {/* Description */}
        {vm.product.body && (
          <div className={styles.description}>
            <p>{vm.product.body}</p>
          </div>
        )}

        {/* Details / Specs */}
        {vm.product.details.length > 0 && (
          <div className={styles.specs}>
            <h4>Χαρακτηριστικά</h4>
            {vm.product.details.map((detail) => (
              <div key={detail.key} className={styles.specRow}>
                <span className={styles.specKey}>{detail.key}</span>
                <span>{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
