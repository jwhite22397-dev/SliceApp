import { CATEGORIES } from "../lib/categories";

interface CategoryBarProps {
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryBar({ active, onSelect }: CategoryBarProps) {
  return (
    <nav className="categories" aria-label="Pizza categories">
      <div className="categories__inner">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category ${active === cat.id ? "is-active" : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            <span className="category__ring">
              <span className="category__emoji">{cat.emoji}</span>
            </span>
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
