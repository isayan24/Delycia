"use client";
import { fetchCategory } from "@/helpers/fetchCategory";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import Link from "@/lib/next-compat";
import { usePathname } from "@/lib/next-compat";
import React, { useEffect, useState, useCallback } from "react";
import { useRestaurantId } from "@/hooks/useRestaurantId";

interface Category {
  id: string | number;
  name: string;
  img: string;
}

export default function CategorySIdebarSmall() {
  const [category, setCategory] = useState<Category[]>([]);
  const pathname = usePathname();
  const rid = useRestaurantId();

  const refreshCategories = useCallback(async () => {
    try {
      const data = await fetchCategory(rid);
      setCategory(data.categories);
    } catch (err) {
      console.log("error in fetching category", err);
    }
  }, [rid]);

  useEffect(() => {
    if (rid !== null) {
      refreshCategories();
    }
  }, [rid, refreshCategories]);

  const isActiveLink = (categoryName: any) => {
    const categoryPath = `/category/${categoryName.toLowerCase()}`;
    return pathname === categoryPath;
  };

  return (
    <div
      style={{ scrollbarWidth: "none", boxShadow: "-4px 0px 6px #000" }}
      className="h-[100vh] w-[4.2rem] fixed top-0 left-0 bg-white flex flex-col items-center gap-3 py-5 overflow-hidden 
      transition-all duration-300 ease-in-out 
      "
    >
      {category.map((cat) => (
        <Link
          href={`/category/${cat.name.toLowerCase()}`}
          key={cat.id}
          className={`flex flex-col items-center gap-1 cursor-pointer relative select-none ${isActiveLink(cat.name) ? "text-orange-600 scale-100" : "scale-95"} w-[75%] transition-all duration-300 ease-in-out`}
        >
          {isActiveLink(cat.name) && (
            <span className="absolute z-10 -right-[.52rem] top-0 bottom-0 w-[.25rem] bg-orange-500 rounded-l-full"></span>
          )}
          <div className="rounded-full h-[3rem] w-[3rem]">
            <UseOptimizeImage
              src={cat.img}
              alt={cat.name}
              width={100}
              height={100}
              rounded="rounded-full"
              className="rounded-full"
            />
          </div>
          <span className="text-xs text-center">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
