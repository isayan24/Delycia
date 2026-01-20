import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/reports/inventory')({
  component: InventoryReportPage,
})

function InventoryReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Report</h1>
        <p className="text-muted-foreground">
          Track your inventory levels and stock status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This report is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50 text-gray-400">
            Inventory Report Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
