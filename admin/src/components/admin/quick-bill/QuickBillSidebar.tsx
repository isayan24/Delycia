import { Card } from '@/components/ui/card'
import BillSummary from './BillSummary'
import CustomerSearch from './CustomerSearch'
import { Customer } from './QuickBillMain'

interface QuickBillSidebarProps {
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  cart: any[]
  updateQuantity: (itemId: string, delta: number) => void
  onOrderComplete: () => void
  discount: number
  setDiscount: (discount: number) => void
  subtotal: number
  taxAmount: number
  taxPercent: number
  grandTotal: number
}

export default function QuickBillSidebar({
  selectedCustomer,
  setSelectedCustomer,
  cart,
  updateQuantity,
  onOrderComplete,
  discount,
  setDiscount,
  subtotal,
  taxAmount,
  taxPercent,
  grandTotal,
}: QuickBillSidebarProps) {
  return (
    <Card className="flex flex-col p-3 gap-3 sidebar:h-[calc(100vh-6rem)] sidebar:overflow-hidden border-none shadow-none @md:border @md:shadow-sm sticky">
      <h2 className="text-lg font-bold hidden @md:block">Quick Bill</h2>

      <CustomerSearch
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
      />

      <div className="sidebar:flex-1 sidebar:overflow-hidden sidebar:min-h-0">
        <BillSummary
          cart={cart}
          updateQuantity={updateQuantity}
          selectedCustomer={selectedCustomer}
          onOrderComplete={onOrderComplete}
          discount={discount}
          setDiscount={setDiscount}
          subtotal={subtotal}
          taxAmount={taxAmount}
          taxPercent={taxPercent}
          totalAmount={grandTotal}
        />
      </div>
    </Card>
  )
}
