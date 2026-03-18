import Link from "next/link";
import styles from "./PageGone.module.scss";

export function PageGone() {
  return (
    <div className={styles.container}>
      <h1>410</h1>
      <h2>This page is no longer available</h2>
      <p>The content you&apos;re looking for has been permanently removed.</p>
      <Link href="/" className={styles.link}>
        Go to homepage
      </Link>
    </div>
  );
}
