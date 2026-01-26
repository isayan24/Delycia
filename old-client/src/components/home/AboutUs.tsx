'use client';
import { Flame, Headset } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function AboutUs() {
  const handleBtnClick = () => {
    toast.info("Feature under development");
  };
  return (
    <div className="opacity-30s">
      <hr className="border-b-[1px] border-[#f8f8f8de]" />

      <header className="flex justify-between items-center p-5 py-2 ">
        <ul className="flex gap-4 text-sm h-5">
          <li
            onClick={handleBtnClick}
            className="flex gap-1 items-center max-[500px]:text-xs cursor-pointer"
          >
            <Flame className="h-5 w-5 text-orange-600 fill-orange-500 max-[500px]:h-4 max-[500px]:w-4" />{" "}
            Hot Deals
          </li>
          <li onClick={handleBtnClick} className="max-[500px]:text-xs cursor-pointer">
            About Us
          </li>
          <li onClick={handleBtnClick} className="max-[500px]:text-xs cursor-pointer">
            Contact Us
          </li>
        </ul>
        <div className="flex items-center gap-2 max-[500px]:hidden">
          <Headset className="h-8 w-8" />
          <section>
            <h1
              onClick={handleBtnClick}
              className="text-[#c77b00] font-semibold cursor-pointer"
            >
              +91 9089907867
            </h1>
            <h2 onClick={handleBtnClick} className="text-zinc-500 !text-xs cursor-pointer">
              24/7 Support center
            </h2>
          </section>
        </div>
      </header>
      <hr className="border-b-[1px] border-[#f8f8f8de]" />
    </div>
  );
}
