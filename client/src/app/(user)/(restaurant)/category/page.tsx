"use client";
import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchCategory } from "@/helpers/fetchCategory";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantId } from "@/hooks/useRestaurantId";

interface Category {
  id: string;
  name: string;
  img: string;
}

export default function CategoryItem() {
  const [categoryItems, setCategoryItems] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const rid = useRestaurantId();

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchCategory(rid);
      setCategoryItems(data.categories);
    } catch (err) {
      console.log("error in fetching category", err);
    } finally {
      setIsLoading(false);
    }
  }, [rid]); 

  useEffect(() => {
    if (rid !== null) {
      refreshCategories();
    }
  }, [rid, refreshCategories]);

  // Skeleton placeholders array - adjust count as needed
  const skeletonPlaceholders = Array.from({ length: 12 }, (_, index) => index);

  return (
    <main className="max-w-[65rem] mx-auto p-2 sm:p-4">
      {/* CSS with custom media query at 700px */}
      <style jsx>{`
        .category-grid {
          display: grid;
          gap: 10px;
        }
        /* Mobile layout (2:1 pattern) */
        @media (max-width: 700px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .category-card {
            height: 7rem;
            border-radius: 0.5rem;
          }
          /* Every 3rd item spans 2 columns and is taller */
          .category-grid > div:nth-child(3n) {
            grid-column: span 2;
            height: 10rem;
            margin-bottom: 0.5rem;
          }
        }
        /* Desktop layout (2:3:1 pattern) */
        @media (min-width: 701px) {
          .category-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
          }
          .category-card {
            height: 10rem;
            border-radius: 0.75rem;
          }
          /* First 2 items in each group of 6 span 3 columns */
          .category-grid > div:nth-child(6n + 1),
          .category-grid > div:nth-child(6n + 2) {
            grid-column: span 3;
          }
          /* Middle 3 items in each group of 6 span 2 columns */
          .category-grid > div:nth-child(6n + 3),
          .category-grid > div:nth-child(6n + 4),
          .category-grid > div:nth-child(6n + 5) {
            grid-column: span 2;
          }
          /* Last item in each group of 6 spans full width and is taller */
          .category-grid > div:nth-child(6n) {
            grid-column: span 6;
            height: 20rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div className="category-grid mt-3">
        {isLoading
          ? // Show skeleton placeholders
            skeletonPlaceholders.map((index) => (
              <div key={`skeleton-${index}`} className="category-card">
                <Skeleton className="w-full h-full rounded-lg bg-gray-200" />
              </div>
            ))
          : // Show actual category items
            categoryItems.map((item) => (
              <div
                key={item.id}
                className="category-card relative overflow-hidden border border-gray-500 shadow-sm"
              >
                <Link href={`/category/${item.name.toLowerCase()}`}>
                  <div className="absolute inset-0 bg-transparent bg-blue-200">
                    <UseOptimizeImage
                      src={item.img}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <h2 className="text-white font-bold text-sm md:text-xl uppercase">
                      {item.name}
                    </h2>
                  </div>
                </Link>
              </div>
            ))}
      </div>
    </main>
  );
}
