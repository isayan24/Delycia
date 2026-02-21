import React from 'react'
import { Power } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface OperationsSectionProps {
  formData: any
  handleSwitchChange: (id: string, checked: boolean) => void
}

export const OperationsSection: React.FC<OperationsSectionProps> = ({
  formData,
  handleSwitchChange,
}) => {
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
            <div className="space-y-0.5">
              <Label className="text-[13px] font-semibold">
                Accepting Orders
              </Label>
              <p className="text-[11px] text-slate-500">
                Global toggle for store
              </p>
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
            <div className="space-y-0.5">
              <Label className="text-[13px] font-semibold">Online Store</Label>
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[13px] font-semibold">Dining Style</Label>
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
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
