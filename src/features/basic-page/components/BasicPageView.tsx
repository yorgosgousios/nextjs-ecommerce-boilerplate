import type { BasicPage } from "../model/types";
import styles from "./BasicPageView.module.scss";

interface BasicPageViewProps {
  page: BasicPage;
}

export function BasicPageView({ page }: BasicPageViewProps) {
  return (
    <article className={styles.page}>
      <h1>{page.title}</h1>
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </article>
  );
}
