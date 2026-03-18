import { ReactNode } from "react";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $cartItemCount } from "@/features/cart/store/cartStore";
import styles from "./MainLayout.module.scss";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const cartCount = useUnit($cartItemCount);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Store
        </Link>

        <nav className={styles.nav}>
          <Link href="/products">Products</Link>
          <Link href="/cart" className={styles.cartLink}>
            Cart
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
      </footer>
    </div>
  );
}
