import { Card } from '@/components/ui/card'
import BillSummary from './BillSummary'
import CustomerSearch from './CustomerSearch'
import { CartItem, Customer } from './QuickBillMain'

interface QuickBillSidebarProps {
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  cart: CartItem[]
  updateQuantity: (itemId: string, delta: number) => void
  onOrderComplete: () => void
  discount: number
  setDiscount: (discount: number) => void
}

export default function QuickBillSidebar({
  selectedCustomer,
  setSelectedCustomer,
  cart,
  updateQuantity,
  onOrderComplete,
  discount,
  setDiscount,
}: QuickBillSidebarProps) {
  return (
    <Card className="flex-1 flex flex-col overflow-hidden p-3 gap-3 h-full border-none shadow-none md:border md:shadow-sm">
      <h2 className="text-lg font-bold hidden md:block">Quick Bill</h2>

      <CustomerSearch
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
      />

      <div className="flex-1 overflow-hidden min-h-0">
        <BillSummary
          cart={cart}
          updateQuantity={updateQuantity}
          selectedCustomer={selectedCustomer}
          onOrderComplete={onOrderComplete}
          discount={discount}
          setDiscount={setDiscount}
        />
      </div>
    </Card>
  )
}
