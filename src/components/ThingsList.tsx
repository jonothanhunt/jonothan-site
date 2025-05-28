"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import FilterChips from "@/components/FilterChips";

interface ThingsListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

export function ThingsList({ initialPosts, selectedSlug }: ThingsListProps) {
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  
  // Get unique types from all posts
  const availableTypes = useMemo(() => {
    const types = new Set(initialPosts.map(post => post.type));
    return Array.from(types).sort() as ThingType[];
  }, [initialPosts]);
  
  const filteredPosts = selectedTypes.length > 0 
    ? initialPosts.filter(post => selectedTypes.includes(post.type))
    : initialPosts;

  const handleTypeSelect = (type: ThingType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
  };

  return (
    <div className="">
      <div className="h-42" />
      <div className="container max-w-3xl mx-auto py-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <FilterChips 
          selectedTypes={selectedTypes}
          availableTypes={availableTypes}
          onTypeSelect={handleTypeSelect}
          onClearFilters={handleClearFilters}
        />
        <div className="space-y-8">
          {filteredPosts.map((post) => {
            const isSelected = post.slug === selectedSlug;

            return (
              <div
                key={post.slug}
                className="border-purple-200 rounded-4xl overflow-clip shadow-xl shadow-purple-950/10 transition-all duration-1000"
              >
                <Link href={isSelected ? "/blog" : `/blog/${post.slug}`}>
                  <div
                    className={`flex flex-col-reverse p-5 sm:flex-row gap-2 justify-between bg-gradient-to-br sm:bg-gradient-to-bl from-purple-300/20 via-purple-100 to-purple-100 transition-all duration-1000 ${
                      isSelected
                        ? "rounded-t-4xl rounded-b-none"
                        : "rounded-t-4xl rounded-b-4xl"
                    }`}
                  >
                    <h2 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
                      {post.title}
                    </h2>
                    <div className="flex gap-2 min-w-fit">
                      <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70 shadow-xl shadow-purple-950/20 text-sm">
                        {formatCustomDate(post.date)}
                      </p>
                      <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70 shadow-xl shadow-purple-950/20 text-sm">
                        {post.type}
                      </p>
                    </div>
                  </div>
                </Link>
                {isSelected && <DynamicMDXContent slug={post.slug} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
