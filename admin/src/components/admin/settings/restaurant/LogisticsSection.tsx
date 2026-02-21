import React from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface LogisticsSectionProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleGetLocation: () => void
  isLocationLoading: boolean
}

export const LogisticsSection: React.FC<LogisticsSectionProps> = ({
  formData,
  handleInputChange,
  handleGetLocation,
  isLocationLoading,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <MapPin className="size-4 text-indigo-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Address & Contact
        </h2>
      </div>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className="text-[13px] font-semibold"
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold">
                Business Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[13px] font-semibold">
              Full Address
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address ?? ''}
              onChange={handleInputChange}
              className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-[13px] font-semibold">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-[13px] font-semibold">
                State
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode" className="text-[13px] font-semibold">
                Pincode
              </Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="fssai_license"
                className="text-[13px] font-semibold"
              >
                FSSAI
              </Label>
              <Input
                id="fssai_license"
                name="fssai_license"
                value={formData.fssai_license ?? ''}
                onChange={handleInputChange}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 uppercase"
                placeholder="LICENSE NO"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-[13px] font-semibold">
                Geo Coordinates
              </Label>
              <Button
                type="button"
                variant="link"
                onClick={handleGetLocation}
                disabled={isLocationLoading}
                className="text-indigo-600 h-auto p-0 text-xs font-bold uppercase tracking-tight"
              >
                {isLocationLoading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3 mr-1" />
                )}
                Sync Location
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-tighter">
                  Latitude
                </span>
                <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {formData.latitude || '—'}
                </code>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-tighter">
                  Longitude
                </span>
                <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {formData.longitude || '—'}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
