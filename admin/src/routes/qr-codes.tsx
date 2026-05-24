/**
 * QR Code Generator Page - Mobile-First Enhanced Version
 * 
 * Senior Developer Approach:
 * - Progressive disclosure: Show only what's needed at each step
 * - Sheet/Drawer for configuration on mobile
 * - Sticky action buttons for easy access
 * - Optimized touch targets (min 44x44px)
 * - Reduced cognitive load with step-by-step flow
 * - Preview-first approach on mobile
 */

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { useState, useEffect } from 'react'
import { 
  Loader2, 
  Download, 
  QrCode, 
  Settings2, 
  ChevronRight,
  Info,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TableSelector } from '@/components/admin/TableSelector'
import { QRCodePreview } from '@/components/admin/QRCodePreview'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useIsMobile } from '@/hooks/useIsMobile'
import { qrCodeGenerator } from '@/services/qrCodeGenerator'
import { downloadService } from '@/services/downloadService'
import axios from 'axios'
import { toast } from 'sonner'
import type { GeneratedQRCode } from '@/types/qr-code.types'

export const Route = createFileRoute('/qr-codes')({
  beforeLoad: requireAuth,
  component: QRCodeGeneratorPage,
})

function QRCodeGeneratorPage() {
  const { selectedRestaurant } = useRestaurantSelector()
  const isMobile = useIsMobile()
  
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [tableZoneMap, setTableZoneMap] = useState<Map<string, string>>(new Map())
  const [tableIdMap, setTableIdMap] = useState<Map<string, number>>(new Map())
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('Scan to order from menu')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQRCode[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Mobile-specific state
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<'tables' | 'customize' | 'preview'>('tables')

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
      const qrCodeConfigs = selectedTables.map((tableNumber) => {
        const tableId = tableIdMap.get(tableNumber)
        return {
          url: tableId 
            ? `cousins.delycia.com/${selectedRestaurant.username}?table=${tableId}`
            : `cousins.delycia.com/${selectedRestaurant.username}`,
          topText,
          bottomText,
          tableId: tableId || null,
          tableNumber,
          restaurantUsername: selectedRestaurant.username!,
        }
      })

      // First, create tables that don't exist yet
      const tablesToCreate = selectedTables
        .filter((tableNumber) => !tableIdMap.has(tableNumber))
        .map((tableNumber) => ({
          table_number: tableNumber,
          zone: tableZoneMap.get(tableNumber) || 'Main',
        }))

      if (tablesToCreate.length > 0) {
        try {
          const response = await axios.post('/api/qr-codes/create-tables', {
            rid: selectedRestaurant.id,
            tables: tablesToCreate,
          })
          
          const createdTablesCount = response.data?.createdTablesCount || 0
          const skippedTablesCount = response.data?.skippedTablesCount || 0
          
          // Fetch the newly created tables to get their IDs
          if (createdTablesCount > 0) {
            const tablesResponse = await axios.get(`/admin/tables?rid=${selectedRestaurant.id}`)
            const allTables = tablesResponse.data?.tables || []
            
            // Update tableIdMap with newly created table IDs
            const newIdMap = new Map(tableIdMap)
            tablesToCreate.forEach((table) => {
              const foundTable = allTables.find((t: any) => t.table_number === table.table_number)
              if (foundTable) {
                newIdMap.set(table.table_number, foundTable.id)
              }
            })
            setTableIdMap(newIdMap)
            
            // Update qrCodeConfigs with the new table IDs
            qrCodeConfigs.forEach((config) => {
              if (!config.tableId && config.tableNumber) {
                const tableId = newIdMap.get(config.tableNumber)
                if (tableId) {
                  config.tableId = tableId
                  config.url = `order.delycia.com/${selectedRestaurant.username}?table=${tableId}`
                }
              }
            })
          }
          
          if (createdTablesCount > 0 && skippedTablesCount > 0) {
            toast.success(`${createdTablesCount} new table(s) created, ${skippedTablesCount} already existed.`)
          } else if (createdTablesCount > 0) {
            toast.success(`${createdTablesCount} new table(s) created.`)
          } else if (skippedTablesCount > 0) {
            toast.info(`All ${skippedTablesCount} table(s) already exist.`)
          }
        } catch (tableCreationError: any) {
          toast.warning('Table creation failed. QR codes will be generated without table IDs.')
        }
      }

      const generated = await qrCodeGenerator.generateBatch(qrCodeConfigs)
      setGeneratedQRCodes(generated)
      toast.success('QR codes generated successfully!')
      
      // Close config and show preview on mobile
      if (isMobile) {
        setIsConfigOpen(false)
        setCurrentStep('preview')
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

  const handleClearAll = () => {
    setGeneratedQRCodes([])
    setSelectedTables([])
    setTableZoneMap(new Map())
    setTableIdMap(new Map())
    setError(null)
    toast.success('All QR codes cleared')
  }

  if (!selectedRestaurant) {
    return (
      <div className="container mx-auto p-4 md:p-6">
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

  // Mobile-first: Use Drawer for bottom sheet experience
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]d">
        {/* Header - Fixed */}
        <div className="flex-none p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              <div>
                <h1 className="text-lg font-bold">QR Codes</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedRestaurant.name}
                </p>
              </div>
            </div>
            
            <Drawer open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DrawerTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Configure
                  {selectedTables.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTables.length}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="shrink-0">
                  <DrawerTitle>Configure QR Codes</DrawerTitle>
                  <DrawerDescription>
                    Select tables and customize your QR codes
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="flex-1 overflow-y-auto px-4">
                  <div className="space-y-6 pb-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between">
                      {(['tables', 'customize'] as const).map((step, index) => (
                        <div key={step} className="flex items-center flex-1">
                          <button
                            onClick={() => setCurrentStep(step)}
                            className={`flex items-center gap-2 ${
                              currentStep === step
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                currentStep === step
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="text-sm">
                              {step === 'tables' ? 'Tables' : 'Customize'}
                            </span>
                          </button>
                          {index < 1 && (
                            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Step Content */}
                    {currentStep === 'tables' && (
                      <div className="space-y-4">
                        <TableSelector
                          restaurantId={Number(selectedRestaurant.id)}
                          selectedTables={selectedTables}
                          onTablesChange={setSelectedTables}
                          onTableZoneMapChange={setTableZoneMap}
                          onTableIdMapChange={setTableIdMap}
                        />
                        
                        {selectedTables.length > 0 && (
                          <Button
                            onClick={() => setCurrentStep('customize')}
                            className="w-full"
                            size="lg"
                          >
                            Next: Customize Text
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    {currentStep === 'customize' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="top-text-mobile">Restaurant Name</Label>
                          <Input
                            id="top-text-mobile"
                            type="text"
                            placeholder="Restaurant name"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            className="min-h-[48px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            Displayed at the top of QR code
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bottom-text-mobile">Call to Action</Label>
                          <Input
                            id="bottom-text-mobile"
                            type="text"
                            placeholder="Scan to order from menu"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            className="min-h-[48px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            Displayed at the bottom of QR code
                          </p>
                        </div>

                        {error && (
                          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
                            <Info className="h-4 w-4 text-destructive mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DrawerFooter className="shrink-0 border-t">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || selectedTables.length === 0}
                    className="w-full min-h-[48px]"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate {selectedTables.length} QR Code{selectedTables.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Content - Scrollable */}
        <ScrollArea className="flex-1">
          {generatedQRCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No QR Codes Yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tap "Configure" to select tables and generate QR codes
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {generatedQRCodes.length} QR code{generatedQRCodes.length !== 1 ? 's' : ''} generated
                </p>
                <div className="flex gap-2">
                  {generatedQRCodes.length > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download All
                    </Button>
                  )}
                  <Button
                    onClick={handleClearAll}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* QR Code Grid */}
              <div className="grid grid-cols-1 gap-4">
                {generatedQRCodes.map((qrCode) => (
                  <QRCodePreview
                    key={qrCode.tableNumber || 'general'}
                    qrCode={qrCode}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    )
  }

  // Desktop: Traditional layout with Sheet for advanced options
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
            onTableIdMapChange={setTableIdMap}
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
              <div className="flex gap-2">
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
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="min-h-[44px] text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
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
