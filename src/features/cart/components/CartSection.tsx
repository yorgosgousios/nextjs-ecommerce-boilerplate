import Image from "next/image";
import Link from "next/link";
import { useCartViewModel } from "../viewmodel/useCartViewModel";
import { formatPrice } from "@/core/lib/formatters";
import styles from "./CartSection.module.scss";

export function CartSection() {
  const vm = useCartViewModel();

  if (vm.isEmpty) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className={styles.continueLink}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.items}>
        <div className={styles.header}>
          <h2>Shopping Cart ({vm.itemCount})</h2>
          <button className={styles.clearButton} onClick={vm.onClearCart}>
            Clear cart
          </button>
        </div>

        {vm.items.map((item) => (
          <div key={item.productId} className={styles.item}>
            <div className={styles.itemImage}>
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="80px" />
              )}
            </div>

            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
            </div>

            <div className={styles.itemQuantity}>
              <button
                onClick={() =>
                  vm.onQuantityChange(item.productId, item.quantity - 1)
                }
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  vm.onQuantityChange(item.productId, item.quantity + 1)
                }
              >
                +
              </button>
            </div>

            <p className={styles.itemTotal}>
              {formatPrice(item.price * item.quantity)}
            </p>

            <button
              className={styles.removeButton}
              onClick={() => vm.onRemove(item.productId)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <h3>Order Summary</h3>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{vm.formattedSubtotal}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Total</span>
          <span>{vm.formattedSubtotal}</span>
        </div>
        <button
          className={styles.checkoutButton}
          onClick={vm.onProceedToCheckout}
          disabled={vm.isValidating}
        >
          {vm.isValidating ? "Validating…" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
}
