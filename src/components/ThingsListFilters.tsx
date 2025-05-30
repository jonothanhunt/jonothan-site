"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ThingType } from "@/types/thing";
import FilterChips from "@/components/FilterChips";

interface ThingsListFiltersProps {
  availableTypes: ThingType[];
  onFiltersChange: (types: ThingType[]) => void;
}

export function ThingsListFilters({ availableTypes, onFiltersChange }: ThingsListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize selected types from URL
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>(() => {
    const types = searchParams.get("types")?.split(",") || [];
    return types.filter((type): type is ThingType =>
      availableTypes.includes(type as ThingType)
    );
  });

  // Keep selected types in sync with URL parameters
  useEffect(() => {
    const types = searchParams.get("types")?.split(",") || [];
    const validTypes = types.filter((type): type is ThingType =>
      availableTypes.includes(type as ThingType)
    );
    setSelectedTypes(validTypes);
    onFiltersChange(validTypes);
  }, [searchParams, availableTypes, onFiltersChange]);

  // Update URL when filters change
  const updateURLParams = (types: ThingType[]) => {
    const params = new URLSearchParams(searchParams);
    if (types.length > 0) {
      params.set("types", types.join(","));
    } else {
      params.delete("types");
    }
    
    // If we're viewing an article, redirect to the main list view
    if (pathname !== "/things") {
      router.push(`/things${params.toString() ? `?${params}` : ""}`);
    } else {
      router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
    }
  };

  const handleTypeSelect = (type: ThingType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    updateURLParams(newTypes);
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    updateURLParams([]);
  };

  return (
    <div className="max-w-3xl mx-auto pb-8 font-[family-name:var(--font-hyperlegible)]">
      <FilterChips
        selectedTypes={selectedTypes}
        availableTypes={availableTypes}
        onTypeSelect={handleTypeSelect}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
