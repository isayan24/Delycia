/**
 * QRCodePreview Component
 *
 * Displays individual QR code with download button.
 * Shows the QR code image with custom text, encoded URL, and table number label.
 *
 * Features:
 * - Displays QR code image as it will appear in downloaded file
 * - Shows encoded URL for verification
 * - Displays table number label when applicable
 * - Individual download button
 * - Responsive sizing for different viewport widths
 */

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { GeneratedQRCode } from '@/types/qr-code.types'

interface QRCodePreviewProps {
  qrCode: GeneratedQRCode
  onDownload: (qrCode: GeneratedQRCode) => void
}

export function QRCodePreview({ qrCode, onDownload }: QRCodePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {qrCode.tableNumber
            ? `Table ${qrCode.tableNumber}`
            : 'General QR Code'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* QR Code Image */}
        <div className="flex justify-center bg-white p-4 rounded-lg border">
          <img
            src={qrCode.dataUrl}
            alt={
              qrCode.tableNumber
                ? `QR code for table ${qrCode.tableNumber}`
                : 'General QR code'
            }
            className="w-full max-w-[300px] h-auto"
          />
        </div>

        {/* Encoded URL */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Encoded URL:
          </p>
          <p className="text-sm font-mono bg-muted p-2 rounded break-all">
            {qrCode.url}
          </p>
        </div>

        {/* Filename */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Filename:</p>
          <p className="text-sm font-mono bg-muted p-2 rounded break-all">
            {qrCode.filename}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onDownload(qrCode)}
          className="w-full min-h-[44px]"
          variant="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </CardFooter>
    </Card>
  )
}
