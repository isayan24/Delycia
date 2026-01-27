import React, { useEffect, useState, useCallback } from "react";
import HomePageTabs from "./HomePageTabs";
import {
  controlNavbarScroll,
  controlBackgroundImage,
  useNavVisibility,
} from "@/utils/scrollUtils";
import svg from "../../../public/homesvg1.svg";
import Image from "@/lib/next-compat";
import HeaderSearch from "./HeaderSearch";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function HeaderHero({ category, onTabSwitch }: any) {
  const [visible, setVisible] = useState(true); // Controls navbar visibility
  const [showImage, setShowImage] = useState(true); // Controls background image visibility
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  const setNavVisible = useNavVisibility((state) => state.setNavVisible);
  const isLargeScreen = useMediaQuery("(min-width: 1151px)", false);

  // You can adjust these threshold values as needed
  const SCROLL_THRESHOLD = 10; // pixels for navbar hide/show
  const TOP_THRESHOLD = 15; // pixels from top to show background image

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to control both navbar and image visibility on scroll
  const controlScrollBehavior = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;
      // Control navbar visibility
      controlNavbarScroll({
        currentScrollY,
        lastScrollY,
        setVisible,
        setLastScrollY,
        threshold: SCROLL_THRESHOLD,
      });
      // Control background image visibility
      controlBackgroundImage({
        currentScrollY,
        setShowImage,
        topThreshold: TOP_THRESHOLD,
      });
    }
  }, [lastScrollY]);

  // Update global state when component state changes
  useEffect(() => {
    setNavVisible(visible);
  }, [visible, setNavVisible]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlScrollBehavior);
      // Cleanup
      return () => {
        window.removeEventListener("scroll", controlScrollBehavior);
      };
    }
  }, [controlScrollBehavior]);
  const handleItemSelect = useCallback(
    async (_itemId?: string, _categoryId?: string, categoryName?: string) => {
      if (onTabSwitch && categoryName) {
        onTabSwitch(categoryName);
      }
    },
    [onTabSwitch]
  );

  // Don't render anything on server-side
  if (!mounted) return null;

  // Don't render for large screens (≥1151px)
  if (isLargeScreen) return null;

  return (
    <div
      style={{ scrollbarWidth: "none" }}
      className={`h-fit min-w-[50rem] max-[1150px]:w-full bg-[#ffffffa7] backdrop-blur-lg max-[700px]:min-w-0 max-[700px]:p-0   py-0 fixed top-0 min-[1150px]:rounded-b-[1rem] z-[50] transition-transform duration-500   ${
        showImage ? "translate-y-0" : "-translate-y-[5rem] shadow-md"
      }`}
    >
      {/* Background SVG - Always rendered but with opacity transition */}
      {visible && (
        <div
          className={`absolute inset-0 overflow-hidden min-[1150px]:rounded-b-[1rem] w-full transition-opacity duration-700 ease-in-out ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            width={100}
            height={100}
            className="object-cover w-full h-full"
            src={svg}
            alt="Background"
            priority
          />
        </div>
      )}

      {/* Your existing content with higher z-index */}
      <div className="relative z-10 backdrop-blur-[2px]xxx">
        <div className="h-[6rem] w-full">
          <HeaderSearch onItemSelect={handleItemSelect} />
        </div>
        {!isLargeScreen && (
          <HomePageTabs category={category} showImage={showImage} />
        )}
      </div>
    </div>
  );
}
