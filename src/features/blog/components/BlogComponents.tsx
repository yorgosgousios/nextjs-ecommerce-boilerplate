import Image from "next/image";
import Link from "next/link";
import type { BlogPost, BlogListResponse } from "../model/types";
import styles from "./Blog.module.scss";

// ── Single blog post view ────────────────────────────────
interface BlogViewProps {
  post: BlogPost;
}

export function BlogView({ post }: BlogViewProps) {
  return (
    <article className={styles.article}>
      {post.image && (
        <div className={styles.heroImage}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            priority
          />
        </div>
      )}
      <div className={styles.articleContent}>
        <p className={styles.meta}>
          <span>{post.categoryName}</span>
          <span>{new Date(post.publishedAt).toLocaleDateString("el-GR")}</span>
          <span>{post.author}</span>
        </p>
        <h1>{post.title}</h1>
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Blog listing view (category page) ────────────────────
interface BlogListViewProps {
  listing: BlogListResponse;
  categoryName?: string;
}

export function BlogListView({ listing, categoryName }: BlogListViewProps) {
  return (
    <div className={styles.listing}>
      {categoryName && <h1>{categoryName}</h1>}
      <div className={styles.grid}>
        {listing.posts.map((post) => (
          <Link key={post.id} href={`/${post.slug}`} className={styles.card}>
            {post.image && (
              <div className={styles.cardImage}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )}
            <div className={styles.cardContent}>
              <p className={styles.cardCategory}>{post.categoryName}</p>
              <h3>{post.title}</h3>
              <p className={styles.cardSummary}>{post.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
