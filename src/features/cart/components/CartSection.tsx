import Image from "next/image";
import Link from "next/link";
import { CartViewModel } from "../viewmodel/CartViewModel";
import styles from "./CartSection.module.scss";

export const CartSection = () => {
  const vm = CartViewModel();

  if (vm.isLoading) {
    return (
      <div className={styles.loading}>
        <p>Φόρτωση καλαθιού...</p>
      </div>
    );
  }

  if (vm.isEmpty) {
    return (
      <div className={styles.empty}>
        <h2>Το καλάθι σας είναι άδειο</h2>
        <p>Προσθέστε προϊόντα για να συνεχίσετε</p>
        <Link href="/gynaikeia" className={styles.continueBtn}>
          Συνέχεια αγορών
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.items}>
        <h1 className={styles.title}>Καλάθι ({vm.itemCount})</h1>

        {vm.items.map((item) => (
          <div key={item.order_item_id} className={styles.item}>
            {/* Image */}
            <Link href={item.path} className={styles.itemImage}>
              {item.image[0] && (
                <Image
                  src={item.image[0].url}
                  alt={item.image[0].alt}
                  width={120}
                  height={160}
                  style={{ objectFit: "cover" }}
                />
              )}
            </Link>

            {/* Info */}
            <div className={styles.itemInfo}>
              <p className={styles.itemBrand}>{item.brand}</p>
              <Link href={item.path} className={styles.itemTitle}>
                {item.product_title}
              </Link>
              <p className={styles.itemMeta}>
                {item.color_name} | {item.variation_size}
              </p>
              <p className={styles.itemAvailability}>{item.availability}</p>

              {/* Pricing */}
              <div className={styles.itemPricing}>
                {item.list_price_raw > item.unit_price_raw && (
                  <span className={styles.itemOldPrice}>{item.list_price}</span>
                )}
                <span className={styles.itemPrice}>{item.unit_price}</span>
              </div>

              {/* Quantity */}
              <div className={styles.itemActions}>
                <div className={styles.quantity}>
                  <button
                    onClick={() =>
                      vm.onUpdateQuantity(item.order_item_id, item.quantity - 1)
                    }
                    disabled={vm.isMutating || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      vm.onUpdateQuantity(item.order_item_id, item.quantity + 1)
                    }
                    disabled={vm.isMutating}
                  >
                    +
                  </button>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={() => vm.onRemoveItem(item.order_item_id)}
                  disabled={vm.isMutating}
                >
                  Αφαίρεση
                </button>
              </div>
            </div>

            {/* Line total */}
            <div className={styles.itemTotal}>
              <span>{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary sidebar */}
      <div className={styles.summary}>
        <h3>Σύνοψη</h3>

        <div className={styles.summaryRow}>
          <span>Υποσύνολο</span>
          <span>{vm.subtotal}</span>
        </div>

        {vm.adjustments.map((adj, i) => (
          <div key={i} className={styles.summaryRow}>
            <span>{adj.label}</span>
            <span>{adj.amount}</span>
          </div>
        ))}

        {vm.coupons.map((coupon, i) => (
          <div key={i} className={styles.summaryRowDiscount}>
            <span>Κουπόνι: {coupon.code}</span>
            <span>-{coupon.amount}</span>
          </div>
        ))}

        <div className={styles.summaryTotal}>
          <span>Σύνολο</span>
          <span>{vm.total}</span>
        </div>

        <Link href="/checkout" className={styles.checkoutBtn}>
          Ολοκλήρωση παραγγελίας
        </Link>

        <Link href="/gynaikeia" className={styles.continueLink}>
          Συνέχεια αγορών
        </Link>
      </div>
    </div>
  );
};
