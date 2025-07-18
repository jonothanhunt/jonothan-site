import { ThingType } from "@/types/thing";

interface FilterChipsProps {
  selectedTypes: ThingType[];
  availableTypes: ThingType[];
  onTypeSelect: (type: ThingType) => void;
  onClearFilters: () => void;
}

export default function FilterChips({
  selectedTypes,
  availableTypes,
  onTypeSelect,
  onClearFilters,
}: FilterChipsProps) {
  const hasFilters = selectedTypes.length > 0;

  return (
    <div
      className="max-w-full flex gap-2 items-center px-5 py-10 w-fill sm:w-fit overflow-x-scroll no-scrollbar whitespace-nowrap"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
      }}
    >
      <span className="text-purple-950 text-sm font-semibold">
        Filter:
      </span>
      {availableTypes.map((type) => (
        <button
          key={type}
          onClick={() => onTypeSelect(type)}
          className={`px-3 py-2 rounded-full text-sm transition-all duration-300 border border-white/20 cursor-pointer ${
            selectedTypes.includes(type)
              ? "bg-purple-900/70 text-white shadow-md shadow-purple-900/20 translate-y-[2px]"
              : "bg-pink-200/70 text-purple-950 shadow-xl shadow-pink-900/15 hover:bg-pink-100/90"
          }`}
        >
          {type}
        </button>
      ))}

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-800 text-white text-sm shadow-xl shadow-red-800/20 hover:bg-red-600 transition-all duration-300 cursor-pointer"
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
