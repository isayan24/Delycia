import { Info, Plus, Camera } from 'lucide-react'

export default function PreviewItem({ previewData, className }: any) {
  return (
    <section
      className={`w-full z-10 bg-white py-3 px-2 text-black ${className || 'absolute top-72 left-0'}`}
    >
      <div className="flex gap-2">
        {/* Content */}
        <section className="flex flex-col gap-0 flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-semibold text-wrap line-clamp-2 leading-[15px]">
              {previewData.name || 'Add food name'}
            </h3>
            <div className="w-2.5 h-2.5 border border-green-600 flex items-center justify-center p-px ml-2 shrink-0 mt-1">
              <div className="w-full h-full rounded-full bg-green-600"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 line-clamp-2 my-1 text-wrap leading-[15px]">
            {previewData.description ||
              'Add a detailed description explaining the dish'}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-orange-600 font-semibold text-[13px] my-1">
                ₹{previewData.price || 0}
              </span>
            </div>
            <div className="p-1 rounded-full border-dashed border-gray-500 border">
              <Info size={12} className="text-gray-500" />
            </div>
          </div>
        </section>

        {/* Image Container */}
        <section className="ml-auto h-26 shrink-0 w-26 rounded-md border relative">
          {previewData.image ? (
            <img
              src={previewData.image}
              alt={previewData.name || 'Food item'}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="absolute -bottom-3 left-2">
            <button className="rounded-[13px] h-8 w-22 active:scale-95 transition-all duration-200 text-[#ea580c] relative border border-[#ea580c] text-[.8rem] bg-[#ffe1e1] hover:bg-[#ffe1e1]">
              <Plus className="absolute top-1 right-1 w-3 h-3" />
              Add
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
