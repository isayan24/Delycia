/* eslint-disable @next/next/no-img-element */
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye } from 'lucide-react'
import { CategoryTemplate } from './types/wizardTypes'
import { cn } from '@/lib/utils'

interface TemplateCardProps {
  template: CategoryTemplate
  isSelected: boolean
  onToggle: (id: number) => void
  onPreview?: (template: CategoryTemplate) => void
}

export default function TemplateCard({
  template,
  isSelected,
  onToggle,
  onPreview,
}: TemplateCardProps) {
  const isPopular = template.usage_count >= 10

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-orange-500 border-orange-300',
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(template.id)}
          className="bg-white border-2 shadow-sm h-4 w-4"
        />
      </div>

      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] h-5 px-1.5">
            Popular
          </Badge>
        </div>
      )}

      {/* Preview Button */}
      {onPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview(template)
          }}
          className="absolute bottom-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-gray-700" />
        </button>
      )}

      {/* Card Content */}
      <div className="cursor-pointer" onClick={() => onToggle(template.id)}>
        {/* Image */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {template.img ? (
            <img
              src={template.img}
              alt={template.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext fill='%23a0aec0' font-family='Arial' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
            {template.name}
          </h3>
          <p className="text-[10px] text-gray-500 line-clamp-2 mb-1.5 leading-tight">
            {template.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{template.cuisine_type}</span>
            {template.usage_count > 0 && (
              <span>Used {template.usage_count}x</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
