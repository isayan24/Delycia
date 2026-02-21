import React from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ScheduleSectionProps {
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Clock className="size-4 text-indigo-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Service Schedule
        </h2>
      </div>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-3 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Open
              </Label>
              <Input
                type="time"
                value={formData.open_time?.substring(0, 5) ?? '10:00'}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) return
                  const normalized =
                    val.length === 5 ? `${val}:00` : val.substring(0, 8)
                  setFormData((prev: any) => ({
                    ...prev,
                    open_time: normalized,
                  }))
                }}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Close
              </Label>
              <Input
                type="time"
                value={formData.close_time?.substring(0, 5) ?? '22:00'}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) return
                  const normalized =
                    val.length === 5 ? `${val}:00` : val.substring(0, 8)
                  setFormData((prev: any) => ({
                    ...prev,
                    close_time: normalized,
                  }))
                }}
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              Active Weekdays
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'S', bit: 1 },
                { label: 'M', bit: 2 },
                { label: 'T', bit: 4 },
                { label: 'W', bit: 8 },
                { label: 'T', bit: 16 },
                { label: 'F', bit: 32 },
                { label: 'S', bit: 64 },
              ].map((day, idx) => {
                const isSelected =
                  ((formData.active_days ?? 127) & day.bit) !== 0
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({
                        ...prev,
                        active_days: isSelected
                          ? (prev.active_days ?? 127) & ~day.bit
                          : (prev.active_days ?? 127) | day.bit,
                      }))
                    }}
                    className={cn(
                      'size-8 rounded-lg text-[11px] font-bold transition-all border',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300',
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
