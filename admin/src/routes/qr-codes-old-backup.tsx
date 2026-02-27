/**
 * QR Code Generator Page
 */

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { useState, useEffect } from 'react'
import { Loader2, Download, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSelector } from '@/components/admin/TableSelector'
import { QRCodePreview } from '@/components/admin/QRCodePreview'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { qrCodeGenerator } from '@/services/qrCodeGenerator'
import { downloadService } from '@/services/downloadService'
import axios from 'axios'
import { toast } from 'sonner'
import type { GeneratedQRCode } from '@/types/qr-code.types'

export const Route = createFileRoute('/qr-codes-old-backup')({
  beforeLoad: requireAuth,
  component: QRCodeGeneratorPage,
})

function QRCodeGeneratorPage() {
  const { selectedRestaurant } = useRestaurantSelector()
  
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [tableZoneMap, setTableZoneMap] = useState<Map<string, string>>(new Map())
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('Scan to order from menu')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQRCode[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedRestaurant?.name) {
      setTopText(selectedRestaurant.name)
    }
  }, [selectedRestaurant?.name])

  const handleGenerate = async () => {
    setError(null)
    
    if (!selectedRestaurant) {
      setError('No restaurant selected')
      return
    }

    if (!selectedRestaurant.username) {
      setError('Restaurant username not configured')
      return
    }

    if (selectedTables.length === 0) {
      setError('Please select at least one table')
      return
    }

    setIsGenerating(true)

    try {
      const qrCodeConfigs = selectedTables.map((tableNumber) => ({
        url: `order.delycia.com/${selectedRestaurant.username}?table=${tableNumber}`,
        topText,
        bottomText,
        tableNumber,
        restaurantUsername: selectedRestaurant.username!,
      }))

      const generated = await qrCodeGenerator.generateBatch(qrCodeConfigs)
      setGeneratedQRCodes(generated)

      try {
        // Prepare table data with zone information for table creation
        const tablesToCreate = generated.map((qr) => ({
          table_number: qr.tableNumber,
          zone: tableZoneMap.get(qr.tableNumber || '') || 'Main',
        }))

        const response = await axios.post('/api/qr-codes/create-tables', {
          rid: selectedRestaurant.id,
          tables: tablesToCreate,
        })
        
        // Show success message with table creation info
        const createdTablesCount = response.data?.createdTablesCount || 0
        const skippedTablesCount = response.data?.skippedTablesCount || 0
        
        if (createdTablesCount > 0 && skippedTablesCount > 0) {
          toast.success(`QR codes generated! ${createdTablesCount} new table(s) created, ${skippedTablesCount} already existed.`)
        } else if (createdTablesCount > 0) {
          toast.success(`QR codes generated! ${createdTablesCount} new table(s) created.`)
        } else if (skippedTablesCount > 0) {
          toast.success(`QR codes generated! All ${skippedTablesCount} table(s) already exist.`)
        } else {
          toast.success('QR codes generated successfully!')
        }
      } catch (tableCreationError: any) {
        toast.warning('QR codes generated but table creation failed. You can still download the QR codes.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR codes')
      toast.error('Failed to generate QR codes')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (qrCode: GeneratedQRCode) => {
    try {
      downloadService.downloadPNG(qrCode.dataUrl, qrCode.filename)
      toast.success(`Downloaded ${qrCode.filename}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to download QR code')
    }
  }

  const handleDownloadAll = async () => {
    if (!selectedRestaurant?.username) return

    try {
      const zipFilename = downloadService.generateZipFilename(selectedRestaurant.username)
      
      await downloadService.downloadZIP(
        generatedQRCodes.map((qr) => ({
          filename: qr.filename,
          dataUrl: qr.dataUrl,
        })),
        zipFilename,
      )
      
      toast.success(`Downloaded ${zipFilename}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ZIP archive')
    }
  }

  if (!selectedRestaurant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Restaurant Selected</CardTitle>
            <CardDescription>
              Please select a restaurant from the dropdown to generate QR codes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <QrCode className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate customizable QR codes for {selectedRestaurant.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure QR Codes</CardTitle>
          <CardDescription>
            Select tables and customize the text displayed on your QR codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TableSelector
            restaurantId={Number(selectedRestaurant.id)}
            selectedTables={selectedTables}
            onTablesChange={setSelectedTables}
            onTableZoneMapChange={setTableZoneMap}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="top-text">Top Text</Label>
              <Input
                id="top-text"
                type="text"
                placeholder="Restaurant name"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">
                Text displayed above the QR code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bottom-text">Bottom Text</Label>
              <Input
                id="bottom-text"
                type="text"
                placeholder="Scan to order from menu"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">
                Text displayed below the QR code
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedTables.length === 0}
            className="w-full min-h-[44px]"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating QR Codes...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Codes ({selectedTables.length})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQRCodes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Generated QR Codes</CardTitle>
                <CardDescription>
                  Preview and download your QR codes
                </CardDescription>
              </div>
              {generatedQRCodes.length > 1 && (
                <Button
                  onClick={handleDownloadAll}
                  variant="outline"
                  className="min-h-[44px]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All as ZIP
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedQRCodes.map((qrCode) => (
                <QRCodePreview
                  key={qrCode.tableNumber || 'general'}
                  qrCode={qrCode}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
