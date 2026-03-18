/**
 * Renders a JSON-LD script tag for structured data.
 *
 * Usage:
 *   <JsonLd data={generateProductJsonLd(product)} />
 *
 * Supports multiple schemas on one page:
 *   <JsonLd data={generateProductJsonLd(product)} />
 *   <JsonLd data={generateBreadcrumbJsonLd(breadcrumbs)} />
 */

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
