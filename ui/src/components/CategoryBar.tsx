// ui/src/components/CategoryBar.tsx
import React from 'react';

type Category = 'all' | 'tech' | 'art' | 'science' | 'random';

interface CategoryBarProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function CategoryBar({
  category,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
}: CategoryBarProps) {
  return (
    <div className="category-bar">
      <div className="category-selector">
        <label htmlFor="category">Filter by:</label>
        <select id="category" value={category} onChange={(e) => onCategoryChange(e.target.value as Category)}>
          <option value="all">All</option>
          <option value="tech">Tech</option>
          <option value="art">Art</option>
          <option value="science">Science</option>
          <option value="random">Random</option>
        </select>
      </div>
      <form onSubmit={onSearchSubmit}>
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}