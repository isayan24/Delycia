import { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Share, Printer } from 'lucide-react'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useBillTaxCalculation } from './hooks/useBillTaxCalculation'
import { BillPreview } from './BillPreview'
import { downloadBillAsImage, shareBillAsImage, printBill } from './utils/billActions'
import { BillData } from './types'

interface ThermalBillProps {
  isOpen: boolean
  onClose: () => void
  billData: BillData
  showPrintButton?: boolean
  showDownloadButton?: boolean
  showShareButton?: boolean
  onShareToMobile?: (phoneNumber: string) => void
}

export default function ThermalBill({
  isOpen,
  onClose,
  billData,
  showPrintButton = true,
  showDownloadButton = true,
  showShareButton = true,
  onShareToMobile,
}: ThermalBillProps) {
  const billRef = useRef<HTMLDivElement>(null)
  const { selectedRestaurant } = useRestaurantSelector()

  // Calculate tax breakdown (hook handles rid internally)
  const { taxBreakdown, isLoading, error } = useBillTaxCalculation({
    billData,
  })

  // Show error if restaurant data failed to load
  if (error) {
    console.error('Failed to load restaurant data for bill:', error)
  }

  // Action handlers
  const handleDownload = () => {
    downloadBillAsImage(billData, taxBreakdown).catch((error) => {
      console.error('Download failed:', error)
    })
  }

  const handleShare = () => {
    shareBillAsImage(billData, taxBreakdown, onShareToMobile).catch((error) => {
      console.error('Share failed:', error)
    })
  }

  const handlePrint = () => {
    if (!billRef.current) return
    printBill(billRef.current.innerHTML, billData.orderId)
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <p>Loading bill...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Bill Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Preview */}
          <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
            <div ref={billRef}>
              <BillPreview
                billData={billData}
                taxBreakdown={taxBreakdown}
                restaurantName={selectedRestaurant?.name || billData.restaurantName}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {showDownloadButton && (
              <Button
                onClick={handleDownload}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}

            {showShareButton && (
              <Button
                onClick={handleShare}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            )}

            {showPrintButton && (
              <Button
                onClick={handlePrint}
                className="flex-1 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
