import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const SORT_OPTIONS = [
  { id: 'best', label: '⭐ Best Match' },
  { id: 'distance', label: '📍 Closest' },
  { id: 'rating', label: '🏆 Highest Rated' },
  { id: 'delivery', label: '🚀 Fastest Delivery' },
  { id: 'fee', label: '💸 Lowest Fee' },
];

const FILTER_TAGS = [
  'All',
  'Open Now',
  'Free Delivery',
  'Under 30 min',
  'Top Rated',
];

export default function FilterBar({ count, onSortChange, onFilterChange }) {
  const [activeSort, setActiveSort] = useState('best');
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSort = (id) => {
    setActiveSort(id);
    onSortChange?.(id);
  };

  const handleFilter = (f) => {
    setActiveFilter(f);
    onFilterChange?.(f);
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Filter icon */}
          <div className="flex items-center gap-1.5 text-pizza-red font-semibold text-sm 
                          flex-shrink-0 pr-3 border-r border-gray-200">
            <SlidersHorizontal size={15} />
            <span>{count} spots</span>
          </div>

          {/* Filter tags */}
          {FILTER_TAGS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`flex-shrink-0 text-sm font-medium px-4 py-1.5 rounded-full 
                          transition-all duration-200 whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-pizza-red text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1" />

          {/* Sort options */}
          <select
            value={activeSort}
            onChange={(e) => handleSort(e.target.value)}
            className="flex-shrink-0 text-sm font-medium text-gray-700 bg-gray-100 
                       border-0 rounded-full px-4 py-1.5 cursor-pointer 
                       focus:outline-none focus:ring-2 focus:ring-pizza-red/30
                       hover:bg-gray-200 transition-colors appearance-none pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
