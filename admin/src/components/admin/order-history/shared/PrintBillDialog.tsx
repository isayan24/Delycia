import ThermalBill from '../ThermalBill'

interface PrintBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billData: {
    orderId: string
    restaurantName: string
    tableNo: string | number
    customerName: string
    customerId: string
    discountAmount: number
    customerPhone: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    totalAmount: number
    orderDate: string
  } | null
}

export function PrintBillDialog({
  open,
  onOpenChange,
  billData,
}: PrintBillDialogProps) {
  if (!billData) return null

  // ThermalBill expects billData with paymentMethod and paymentStatus
  const thermalBillData = {
    ...billData,
    paymentMethod: 'Cash', // Default values since we don't have these in our data
    paymentStatus: 'Completed',
  }

  return (
    <ThermalBill
      isOpen={open}
      onClose={() => onOpenChange(false)}
      billData={thermalBillData}
    />
  )
}
