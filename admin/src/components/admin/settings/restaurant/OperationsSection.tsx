import React from 'react'
import { Power, CalendarClock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { InfoTooltip } from '@/components/smallComponents/InfoTooltip'

interface OperationsSectionProps {
  formData: any
  handleSwitchChange: (id: string, checked: boolean) => void
}

export const OperationsSection: React.FC<OperationsSectionProps> = ({
  formData,
  handleSwitchChange,
}) => {
  const isOpenNow = formData.is_open_now === 1
  const statusMessage = formData.status_message || ''
  const hasOverride = !!formData.manual_override_date

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Power className="size-4 text-indigo-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Operations
        </h2>
      </div>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <Label className="text-[13px] font-semibold">
                  Accepting Orders
                </Label>
                <InfoTooltip
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Accepting Orders Control</p>
                      <p>
                        Toggle this to manually open or close your restaurant
                        for accepting orders.
                      </p>
                    </div>
                  }
                  side="right"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {formData.is_active === 1
                  ? isOpenNow
                    ? statusMessage || 'Currently accepting orders'
                    : statusMessage || 'Waiting for scheduled time'
                  : 'Store is manually closed'}
              </p>
              {hasOverride && formData.is_active === 1 && (
                <div className="flex items-center gap-1 mt-1">
                  <CalendarClock className="size-3 text-amber-500" />
                  <span className="text-[10px] font-medium text-amber-600">
                    Manual override active (today only)
                  </span>
                </div>
              )}
            </div>
            <Switch
              checked={formData.is_active === 1}
              onCheckedChange={(checked) =>
                handleSwitchChange('is_active', checked)
              }
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <Label className="text-[13px] font-semibold">
                  Online Store
                </Label>
                <InfoTooltip
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Online Store Feature</p>
                      <p>
                        Enable your digital catalog for customers to browse your
                        menu online. This allows customers to view items, prices,
                        and place orders through your online platform.
                      </p>
                    </div>
                  }
                  side="right"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Enable digital catalog
              </p>
            </div>
            <Switch
              checked={formData.online_orders === 1}
              onCheckedChange={(checked) =>
                handleSwitchChange('online_orders', checked)
              }
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <Label className="text-[13px] font-semibold">
                  Dining Style
                </Label>
                <InfoTooltip
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Dining Style Preference</p>
                      <p>
                        Set your restaurant's food preference. Enable for
                        strictly vegetarian menu, or disable to offer both
                        vegetarian and non-vegetarian options. This helps
                        customers filter menu items based on their dietary
                        preferences.
                      </p>
                    </div>
                  }
                  side="right"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {formData.is_veg_only === 1
                  ? 'Strictly Vegetarian'
                  : 'Veg & Non-Veg'}
              </p>
            </div>
            <Switch
              checked={formData.is_veg_only === 1}
              onCheckedChange={(checked) =>
                handleSwitchChange('is_veg_only', checked)
              }
              className="data-[state=checked]:bg-emerald-500"
            />
          </div> */}
        </CardContent>
      </Card>
    </section>
  )
}
