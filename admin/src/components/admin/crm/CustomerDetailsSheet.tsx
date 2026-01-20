import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCustomerDetailsQuery } from '@/hooks/queries/useCRMQueries'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatISTDateTime } from '../order-history/utils/historyDateUtils'
import { ShoppingBag, Calendar, CreditCard } from 'lucide-react'

interface CustomerDetailsSheetProps {
  customerId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function CustomerDetailsSheet({
  customerId,
  isOpen,
  onClose,
}: CustomerDetailsSheetProps) {
  const { user } = useAuth()
  const rid = user?.selected_rid

  const { data: details, isLoading } = useCustomerDetailsQuery({
    rid: rid?.toString() || '',
    customerId,
  })

  const profile = details?.profile

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <SheetHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profile_pic || ''} />
                <AvatarFallback className="text-lg bg-orange-100 text-orange-600">
                  {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <SheetTitle className="text-xl">{profile.name}</SheetTitle>
                <SheetDescription>
                  {profile.phone_number} • {profile.email || 'No email'}
                </SheetDescription>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {profile.visit_count} Visits
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    ₹{profile.total_spent?.toLocaleString()} Spent
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Order History
              </h3>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  {details?.history?.map((order) => (
                    <div
                      key={order.order_id}
                      className="relative pl-6 pb-6 border-l last:border-0 border-gray-200"
                    >
                      <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white" />

                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm font-medium">
                          Order #{order.order_id}
                        </div>
                        <div className="text-sm font-bold">
                          ₹{order.total_amount}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2 flex gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatISTDateTime(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <CreditCard className="w-3 h-3" />
                          {order.order_status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {order.items}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Customer not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
