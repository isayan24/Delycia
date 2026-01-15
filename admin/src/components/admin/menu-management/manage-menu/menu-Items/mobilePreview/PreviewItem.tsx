import { Camera, Check, Heart, Info, Plus, Triangle } from "lucide-react";

export default function PreviewItem({ previewData }:any) {
    return (
      <section className="absolute top-[18rem] left-0 w-full z-[8] bg-white py-3 px-2 text-black">
        <div className="flex gap-2">
          <section className="flex flex-col gap-0">
            <div className="text-sm font-semibold text-wrap line-clamp-2 leading-[15px]">
              {previewData.name || "Add food name"}
            </div>
            <div className="text-xs text-gray-500 line-clamp-2 my-1 text-wrap leading-[15px]">
              {previewData.description || "Add a detailed description explaining the dish"}
            </div>
            <div className="text-orange-600 font-semibold text-[13px] my-1">
              ₹{previewData.price || 0}
            </div>
  
            {/* <div className="flex items-center gap-1 text-green-600 text-xs">
              <Check className="h-3 w-3" />
              <span className="text-xs font-semibold">Available</span>
            </div> */}
  
            <div className="flex items-center gap-2 text-xs mt-2">
              <div className="p-1 rounded-full border-dashed border-gray-500 border-1">
                <Info className="h-3 w-3" />
              </div>
              {/* <div className="p-1 rounded-full border-dashed border-gray-500 border-1">
                <Heart className="h-3 w-3" />
              </div> */}
              <div className="">
                {previewData.foodType === "Veg" ? (
                  <div className="w-5 h-5 border border-green-500 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 border border-red-500 flex items-center justify-center">
                    <Triangle className="w-3 h-3 text-red-500 fill-red-500" />
                  </div>
                )}
              </div>
            </div>
          </section>
  
          <section className="ml-auto h-[6.5rem] shrink-0 w-[6.5rem] rounded-md border relative">
            {previewData.image ? (
              <img
                src={previewData.image}
                alt="Item preview"
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute -bottom-4 left-2">
              <button
                className="rounded-[13px] h-[2rem] w-[5.5rem] active:scale-95 transition-all duration-200 text-[#ea580c] relative border border-[#ea580c] text-[.8rem] bg-[#ffe1e1] hover:bg-[#ffe1e1]"
              >
                <Plus className="absolute top-1 right-1 w-3 h-3" />
                Add
              </button>
            </div>
          </section>
        </div>
      </section>
    );
  }
  