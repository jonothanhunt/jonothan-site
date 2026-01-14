import { ThingType } from "@/types/thing";
import { PLAYFUL_THEMES } from "@/utils/colorUtils";

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
      {availableTypes.map((type, idx) => {
        const theme = PLAYFUL_THEMES[idx % PLAYFUL_THEMES.length];
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 border cursor-pointer ${isSelected
              ? `${theme.accent} text-white shadow-xl ${theme.shadow} translate-y-[2px] border-transparent`
              : `${theme.bg} ${theme.text} ${theme.border} hover:brightness-95 hover:-translate-y-0.5 hover:shadow-xl shadow-lg ${theme.shadow}`
              }`}
          >
            {type}
          </button>
        );
      })}

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-100 text-red-900 border border-red-200 text-sm font-medium shadow-sm hover:bg-red-200 transition-all duration-300 cursor-pointer"
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
