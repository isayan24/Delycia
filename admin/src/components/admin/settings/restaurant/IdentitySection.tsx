import React from 'react'
import { Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AddImage from '@/components/smallComponents/AddImage'

interface IdentitySectionProps {
  formData: any
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  handleLogoUpload: (url: string | null) => void
  handleBannerUpload: (url: string | null) => void
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  formData,
  handleInputChange,
  handleLogoUpload,
  handleBannerUpload,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Building2 className="size-4 text-indigo-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Identity & Media
        </h2>
      </div>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px] font-semibold">
                Store Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 focus:ring-indigo-500"
                placeholder="e.g., The Gourmet Table"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold">
                Tax Percentage
              </Label>
              <div className="relative">
                <Input
                  id="tax_percent"
                  name="tax_percent"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={formData.tax_percent ?? ''}
                  onChange={handleInputChange}
                  className="pr-8 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
                  placeholder="e.g., 5.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[13px] font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description ?? ''}
              onChange={handleInputChange}
              className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 resize-none"
              placeholder="Tell customers about your kitchen..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold flex items-center gap-2">
                Brand Logo
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">
                  Square
                </span>
              </Label>
              <AddImage
                inputId="restaurantLogo"
                OldImage={formData.logo || null}
                onImageUpload={handleLogoUpload}
                required={false}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold flex items-center gap-2">
                Store Banner
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">
                  Landscape
                </span>
              </Label>
              <AddImage
                inputId="restaurantBanner"
                OldImage={formData.banner || null}
                onImageUpload={handleBannerUpload}
                required={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
