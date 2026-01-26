import React from 'react'

import CategoryTabs from '../selectors/CategoryTabs'
import DummyFood from './DummyFood'
import PreviewItem from './PreviewItem'

export default function MobilePreview({ previewData }: any) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const prevLengthRef = React.useRef(0)

  React.useEffect(() => {
    if (Array.isArray(previewData)) {
      // Only scroll if an item was added (length increased)
      if (previewData.length > prevLengthRef.current) {
        if (scrollContainerRef.current) {
          // Small timeout to allow DOM to update
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: 'smooth',
            })
          }, 100)
        }
      }
      prevLengthRef.current = previewData.length
    } else {
      // Reset for non-array mode (single item)
      prevLengthRef.current = 0
    }
  }, [previewData])

  return (
    <div className="w-full bg-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl relative">
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-full bg-black/70 z-[7] backdrop-blur-[2px]"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

            <div
              ref={scrollContainerRef}
              className="p-0 pt-8 bg-gradient-to-b from-orange-50 to-orange-100 h-full overflow-y-auto no-scrollbar relative"
            >
              <div className="mb-4 px-4">
                <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                  <div className="w-4 h-4 text-gray-400">🔍</div>
                  <span className="text-sm text-gray-500 flex-1 truncate">
                    Search your favorite food
                  </span>
                  <div className="w-4 h-4 text-gray-400">📍</div>
                </div>
              </div>

              <CategoryTabs />

              <div className="pb-20">
                <DummyFood foodName="Italian Pizza" price={459.0} />

                {previewData && !Array.isArray(previewData) && (
                  <PreviewItem
                    previewData={previewData}
                    className="relative border-b border-gray-100"
                  />
                )}

                {previewData &&
                  Array.isArray(previewData) &&
                  previewData.map((item: any, index: number) => (
                    <PreviewItem
                      key={index}
                      previewData={item}
                      className="relative border-b border-gray-100"
                    />
                  ))}

                <DummyFood foodName="Spring Rolls" price={163.93} />
                <DummyFood foodName="Pav Bhaji" price={180.0} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm font-medium text-gray-700">
            Item preview on Delycia
          </p>
        </div>
      </div>
    </div>
  )
}
