import MobilePreview from '../../mobilePreview/MobilePreview'
import { PreviewData } from '../../types/addItemModal'

interface ItemPreviewSectionProps {
  previewData: PreviewData
}

export function ItemPreviewSection({ previewData }: ItemPreviewSectionProps) {
  return (
    <div className="md:w-[400px] hidden md:block h-full overflow-hidden bg-gray-50 border-r relative shrink-0">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <MobilePreview previewData={previewData} />
      </div>
    </div>
  )
}
