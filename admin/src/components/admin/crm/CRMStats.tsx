import { useCRMStatsQuery } from '@/hooks/queries/useCRMQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, UserCheck, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface CRMStatsProps {
  timeRange: string
}

export default function CRMStats({ timeRange }: CRMStatsProps) {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  const { data: stats, isLoading } = useCRMStatsQuery({
    rid: rid?.toString() || '',
    timeRange,
  })

  if (isLoading || !stats) {
    return (
      <div className="flex flex-nowrap overflow-x-auto pb-4 -mx-3 px-3 md:grid md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-none w-[140px] md:w-auto h-24 md:h-28 bg-gray-100 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2 mb-8">
      <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-3 px-3 md:grid md:grid-cols-3 gap-3 scrollbar-none">
        {/* Total Customers */}
        <div className="flex-none w-[170px] md:w-auto p-2.5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-md group flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
            <Users className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 whitespace-nowrap">
              Lifetime Customers
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg md:text-xl font-black text-gray-900 leading-none">
                {stats.totalCustomers.toLocaleString()}
              </h3>
              <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap">
                Total
              </span>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="flex-none w-[170px] md:w-auto p-2.5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-md group flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 whitespace-nowrap">
              New This Month
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg md:text-xl font-black text-gray-900 leading-none">
                {stats.newCustomers.toLocaleString()}
              </h3>
              <div className="flex items-center gap-0.5 text-[8px] md:text-[9px] text-emerald-600 font-black whitespace-nowrap">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>Growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Returning Customers */}
        <div className="flex-none w-[170px] md:w-auto p-2.5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-md group flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <UserCheck className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 whitespace-nowrap">
              Returning Base
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg md:text-xl font-black text-gray-900 leading-none">
                {stats.returningCustomers.toLocaleString()}
              </h3>
              <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap">
                Loyal
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white">
        <CardHeader className="p-4 md:p-6 pb-0 md:pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm md:text-base font-bold text-gray-900">
                Customer Visits Trend
              </CardTitle>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                Tracking engagement over the last 30 days
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="h-[200px] md:h-[260px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.visitTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip
                  cursor={{
                    stroke: '#f97316',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                  }}
                  itemStyle={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#f97316',
                  }}
                  labelStyle={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    marginBottom: '4px',
                    fontWeight: 'bold',
                  }}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                  strokeWidth={2.5}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
