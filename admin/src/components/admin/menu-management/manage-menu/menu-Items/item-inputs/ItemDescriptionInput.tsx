import { ScrollText } from 'lucide-react'

export default function ItemDescriptionInput({
  value,
  onChange,
  hasError,
}: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 sm:mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 sm:h-5 sm:w-5 text-[#ffa908]" />
          <h2 className="text-base sm:text-lg font-[500] text-gray-800">
            Item Description
          </h2>
        </div>
      </div>
      <textarea
        placeholder="Tell us a little bit about the item description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 sm:p-4 text-sm sm:text-base border rounded-md resize-none h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          hasError ? 'border-red-500 bg-red-50' : ''
        }`}
      />
    </div>
  )
}
