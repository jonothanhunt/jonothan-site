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
    const types = new Set(initialPosts.flatMap((post) => post.type));
    return Array.from(types).sort() as ThingType[];
  }, [initialPosts]);

  const filteredPosts =
    selectedTypes.length > 0
      ? initialPosts.filter((post) =>
          selectedTypes.some((type) => post.type.includes(type))
        )
      : initialPosts;

  const handleTypeSelect = (type: ThingType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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
                className="border-purple-200 bg-purple-50 rounded-4xl overflow-clip shadow-xl shadow-purple-900/10 transition-[background-color,box-shadow] duration-300"
              >
                <Link href={isSelected ? "/blog" : `/blog/${post.slug}`}>
                  <div
                    className={`flex flex-col-reverse p-5 sm:flex-row gap-2 justify-between bg-gradient-to-bl from-purple-200 via-transparent to-transparent transition-[background-color] duration-300 ${
                      isSelected
                        ? "rounded-t-4xl rounded-b-none"
                        : "rounded-t-4xl rounded-b-4xl"
                    }`}
                  >
                    <h2 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
                      {post.title}
                    </h2>
                    <div className="z-10 flex min-w-fit gap-2 items-center">
                      {post.type.map((type) => (
                        <p
                          key={type}
                          className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70  text-sm"
                        >
                          {type}
                        </p>
                      ))}
                      <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-purple-50 text-sm">
                        {formatCustomDate(post.date)}
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
