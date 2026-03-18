import Image from "next/image";
import Link from "next/link";
import type { LandingPage, LandingSection } from "../model/types";
import { formatPrice } from "@/core/lib/formatters";
import styles from "./LandingPageView.module.scss";

interface LandingPageViewProps {
  page: LandingPage;
}

export function LandingPageView({ page }: LandingPageViewProps) {
  return (
    <div className={styles.landing}>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionRenderer({ section }: { section: LandingSection }) {
  switch (section.type) {
    case "hero":
      return (
        <section className={styles.hero}>
          {section.image && (
            <div className={styles.heroImage}>
              <Image src={section.image} alt={section.title ?? ""} fill />
            </div>
          )}
          <div className={styles.heroContent}>
            {section.title && <h1>{section.title}</h1>}
            {section.content && <p>{section.content}</p>}
          </div>
        </section>
      );

    case "products":
      return (
        <section className={styles.section}>
          {section.title && <h2>{section.title}</h2>}
          <div className={styles.itemGrid}>
            {section.items?.map((item) => (
              <Link key={item.id} href={item.url} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <Image src={item.image} alt={item.title} fill sizes="220px" />
                </div>
                <h3>{item.title}</h3>
                {item.price && <p>{formatPrice(item.price)}</p>}
              </Link>
            ))}
          </div>
        </section>
      );

    case "categories":
      return (
        <section className={styles.section}>
          {section.title && <h2>{section.title}</h2>}
          <div className={styles.categoryGrid}>
            {section.items?.map((item) => (
              <Link key={item.id} href={item.url} className={styles.categoryCard}>
                <div className={styles.categoryImage}>
                  <Image src={item.image} alt={item.title} fill sizes="300px" />
                </div>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </section>
      );

    case "text":
      return (
        <section className={styles.section}>
          {section.title && <h2>{section.title}</h2>}
          {section.content && (
            <div
              className={styles.textContent}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}
        </section>
      );

    case "banner":
      return (
        <section className={styles.banner}>
          {section.image && (
            <Image src={section.image} alt={section.title ?? ""} fill />
          )}
          <div className={styles.bannerOverlay}>
            {section.title && <h2>{section.title}</h2>}
            {section.content && <p>{section.content}</p>}
          </div>
        </section>
      );

    default:
      return null;
  }
}
