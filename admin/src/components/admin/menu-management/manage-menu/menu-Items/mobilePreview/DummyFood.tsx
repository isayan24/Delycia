import { Check, Heart, Info, Plus, Triangle } from "lucide-react";

export default function DummyFood({ foodName, price }:any) {
    return (
      <div className="bg-white w-full p-3 shadow-sm opacity-50s relative">
        <div className="flex gap-2">
          <section className="flex flex-col gap-0">
            <div className="text-sm font-semibold">
              {foodName || "Spring Rolls"}
            </div>
            <div className="text-xs text-gray-500 line-clamp-2 my-1 text-wrap">
              Crispy deep-fried rolls filled with a mix of sautéed vegetables,
              served with spicy sauce
            </div>
            <div className="text-orange-600 font-semibold text-[13px] my-1">
              ₹{price || 163.93}
            </div>
  
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Check className="h-3 w-3" />
              <span className="text-xs font-semibold">Available</span>
            </div>
  
            <div className="flex items-center gap-2 text-xs mt-2">
              <div className="p-1 rounded-full border-dashed border-gray-500 border-1">
                <Info className="h-3 w-3" />
              </div>
              <div className="p-1 rounded-full border-dashed border-gray-500 border-1">
                <Heart className="h-3 w-3" />
              </div>
              <div className="p-1 border-gray-500 border-1">
                <Triangle className="h-3 w-3" />
              </div>
            </div>
          </section>
  
          <section className="ml-auto h-[6.5rem] shrink-0 w-[6.5rem] border relative">
            <div className="w-full h-full bg-orange-200 flex items-center justify-center text-2xl rounded-md">
              🍽️
            </div>
            <div className="absolute -bottom-4 left-2">
              <button
                className="rounded-[13px] h-[2rem] w-[5.5rem] active:scale-95 transition-all duration-200 text-[#ea580c] relative border border-[#ea580c] text-[.8rem] bg-[#ffe1e1] hover:bg-[#ffe1e1]"
              >
                <Plus className="absolute top-1 right-1" />
                Add
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }