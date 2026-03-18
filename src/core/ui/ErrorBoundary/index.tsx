import React from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Client-side error boundary.
 *
 * Catches React rendering errors that happen AFTER hydration.
 * Server-side errors are handled by getServerSideProps + pages/500.tsx.
 *
 * Wrap this around your layout or around specific feature components.
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Client-side error:", error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#999", marginBottom: "1rem" }}>
            An unexpected error occurred while rendering this page.
          </p>
          <p
            style={{
              color: "#ccc",
              fontSize: "0.8rem",
              marginBottom: "2rem",
              fontFamily: "monospace",
            }}
          >
            {this.state.error?.message}
          </p>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "0.75rem 2rem",
                background: "#2d6a8f",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: "0.75rem 2rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontWeight: 600,
                textDecoration: "none",
                color: "#333",
              }}
            >
              Go to homepage
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
