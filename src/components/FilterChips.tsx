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
      className="max-w-full flex gap-3 items-center px-4 py-4 w-fill sm:w-fit overflow-x-scroll no-scrollbar whitespace-nowrap"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
      }}
    >
{availableTypes.map((type, idx) => {
        const theme = PLAYFUL_THEMES[idx % PLAYFUL_THEMES.length];
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`px-4 py-2 rounded-2xl text-sm font-normal uppercase transition-all duration-300 cursor-pointer ${isSelected
              ? `${theme.accent} text-white`
              : `${theme.bg} ${theme.text} hover:brightness-95`
              }`}
          >
            {type}
          </button>
        );
      })}

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-red-100 text-red-900 text-sm font-normal uppercase hover:bg-red-200 transition-all duration-300 cursor-pointer"
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
