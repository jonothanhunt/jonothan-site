import { ThingType } from '@/types/thing';

interface FilterChipsProps {
  selectedTypes: ThingType[];
  availableTypes: ThingType[];
  onTypeSelect: (type: ThingType) => void;
  onClearFilters: () => void;
}

export default function FilterChips({ selectedTypes, availableTypes, onTypeSelect, onClearFilters }: FilterChipsProps) {
  const hasFilters = selectedTypes.length > 0;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-8">
      {availableTypes.map((type) => (
        <button
          key={type}
          onClick={() => onTypeSelect(type)}
          className={`px-3 py-2 rounded-full text-sm transition-all duration-300 ${
            selectedTypes.includes(type)
              ? 'bg-purple-800 text-white shadow-lg shadow-purple-950/20'
              : 'bg-pink-200/70 text-purple-950 shadow-xl shadow-purple-950/20 hover:bg-purple-300/50'
          }`}
        >
          {type}
        </button>
      ))}
      
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-sm shadow-xl shadow-red-950/20 hover:bg-red-600 transition-all duration-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
