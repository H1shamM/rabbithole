// ui/src/components/SkeletonLoader.tsx
import React from "react";

interface SkeletonLoaderProps {
  type?: "stumble" | "list" | "card";
  count?: number;
}

export function SkeletonLoader({
  type = "stumble",
  count = 1,
}: SkeletonLoaderProps) {
  if (type === "stumble") {
    return (
      <div className="skeleton-stumble">
        <div
          className="skeleton-line skeleton-title"
          style={{ width: "60%", margin: "0 auto" }}
        />
        <div className="skeleton-circle" />
        <div className="skeleton-line" style={{ width: "80%" }} />
        <div className="skeleton-line" style={{ width: "40%" }} />
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-line" style={{ width: "90%" }} />
            <div className="skeleton-line" style={{ width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  // card type (for recommendations)
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-title" style={{ width: "70%" }} />
      <div className="skeleton-line" style={{ width: "100%" }} />
      <div className="skeleton-line" style={{ width: "50%" }} />
    </div>
  );
}
