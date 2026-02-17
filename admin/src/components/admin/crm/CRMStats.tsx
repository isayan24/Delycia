import { useCRMStatsQuery } from '@/hooks/queries/useCRMQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Users, UserPlus, UserCheck } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import NoSSR from '@/components/common/NoSSR'

interface CRMStatsProps {
  timeRange: string
}

const MetricCard: React.FC<{
  title: string
  value: string | number
  label: string
  icon: React.ComponentType<any>
  color: 'orange' | 'emerald' | 'blue'
  isLoading?: boolean
}> = ({ title, value, label, icon: Icon, color, isLoading }) => {
  const variants = {
    orange:
      'bg-orange-50 dark:bg-[#3a291d] text-orange-600 border-orange-100 dark:border-orange-900/10',
    emerald:
      'bg-emerald-50 dark:bg-emerald-900/5 text-emerald-600 border-emerald-100 dark:border-emerald-900/10',
    blue: 'bg-blue-50 dark:bg-blue-900/5 text-blue-600 border-blue-100 dark:border-blue-900/10',
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-3 border border-[#ead9cd] dark:border-primary/10 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-[#3a291d] rounded-lg" />
          <div className="space-y-2">
            <div className="w-16 h-4 bg-slate-100 dark:bg-[#3a291d] rounded" />
            <div className="w-24 h-6 bg-slate-100 dark:bg-[#3a291d] rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-2 md:p-3 border border-[#ead9cd] dark:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex items-center gap-2 md:gap-4">
      <div
        className={`shrink-0 p-1.5 md:p-2.5 rounded-lg md:rounded-xl border ${variants[color]} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#a16b45] group-hover:text-orange-600 transition-colors truncate">
          {title}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 mt-0.5">
          <h3 className="text-sm md:text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <span className="text-[7px] md:text-[9px] text-[#a16b45]/60 font-bold uppercase tracking-tighter truncate">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CRMStats({ timeRange }: CRMStatsProps) {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  const { data: stats, isLoading } = useCRMStatsQuery({
    rid: rid?.toString() || '',
    timeRange,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <MetricCard
          title="Lifetime"
          value={stats?.totalCustomers || 0}
          label="Total Base"
          icon={Users}
          color="orange"
          isLoading={isLoading}
        />
        <MetricCard
          title="Growth"
          value={stats?.newCustomers || 0}
          label="New This Month"
          icon={UserPlus}
          color="emerald"
          isLoading={isLoading}
        />
        <MetricCard
          title="Retention"
          value={stats?.returningCustomers || 0}
          label="Loyal Core"
          icon={UserCheck}
          color="blue"
          isLoading={isLoading}
        />
      </div>

      <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-4 md:p-6 border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Engagement Trend
            </h3>
            <p className="text-[10px] md:text-xs text-[#a16b45] font-semibold uppercase tracking-wider mt-0.5">
              Customer Visits & Interaction
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#a16b45] bg-[#3a291d]/5 px-3 py-1.5 rounded-full animate-pulse uppercase tracking-widest">
              <div className="animate-spin rounded-full h-2.5 w-2.5 border-2 border-orange-500 border-t-transparent"></div>
              <span>Analyzing Engagement...</span>
            </div>
          )}
        </div>

        <div className="h-[250px] md:h-[300px] w-full min-w-0">
          <NoSSR>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={stats?.visitTrend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#a16b45' }}
                  dy={10}
                />
                <YAxis
                  fontSize={12}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#a16b45' }}
                />
                <Tooltip
                  cursor={{
                    stroke: '#fb923c',
                    strokeWidth: 2,
                    strokeDasharray: '4 4',
                  }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #ead9cd',
                    boxShadow: '0 12px 24px rgba(45,30,20,0.1)',
                    padding: '12px',
                    backgroundColor: '#fff',
                  }}
                  itemStyle={{
                    fontSize: '12px',
                    fontWeight: '900',
                    color: '#fb923c',
                  }}
                  labelStyle={{
                    fontSize: '10px',
                    color: '#a16b45',
                    marginBottom: '4px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#fb923c"
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                  strokeWidth={3}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </NoSSR>
        </div>
      </div>
    </div>
  )
}
