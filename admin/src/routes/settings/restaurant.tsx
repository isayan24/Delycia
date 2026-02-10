import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import {
  useRestaurantSettingsQuery,
  useUpdateRestaurantMutation,
  type UpdateRestaurantParams,
} from '@/hooks/queries/useRestaurantSettingsQueries'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  ArrowLeft,
  Loader2,
  Save,
  MapPin,
  Building2,
  Percent,
  Power,
  Leaf,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import AddImage from '@/components/smallComponents/AddImage'
import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'
import { useAuth } from '@/hooks/useAuth'
import useToast from '@/hooks/UseToast'

export const Route = createFileRoute('/settings/restaurant')({
  beforeLoad: requireAuth,
  component: RestaurantSettingsPage,
})

function RestaurantSettingsPage() {
  const { user } = useAuth()
  const rid = user?.selected_rid?.toString()

  // Use the new production-grade query hook
  const {
    data: restaurantData,
    isLoading,
    isError,
    error,
  } = useRestaurantSettingsQuery(rid)

  const restaurant = restaurantData?.restaurant_info

  const [formData, setFormData] = useState<Partial<UpdateRestaurantParams>>({})
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  // Image upload state
  const [logoBase64, setLogoBase64] = useState<string>('')
  const [bannerBase64, setBannerBase64] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track if form has been initialized to prevent resetting on cache updates
  const isInitializedRef = useRef(false)

  const { showError, showSuccess } = useToast()

  // Only populate form data once when restaurant data first arrives
  useEffect(() => {
    if (restaurant && !isInitializedRef.current) {
      isInitializedRef.current = true
      setFormData({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        banner: restaurant.banner || '',
        is_active: restaurant.is_active,
        is_veg_only: restaurant.is_veg_only,
        tax_percent: restaurant.tax_percent,
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || '',
        phone_number: restaurant.phone_number || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        state: restaurant.state || '',
        pincode: restaurant.pincode || '',
        fssai_license: restaurant.fssai_license || '',
      })
    }
  }, [restaurant])

  // Use the new mutation hook
  const mutation = useUpdateRestaurantMutation()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target
    
    // Special validation for tax_percent
    if (name === 'tax_percent') {
      const numValue = parseFloat(value)
      
      // Validate range (0-100)
      if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
        showError('Invalid Tax Percentage', 'Tax percentage must be between 0 and 100')
        return
      }
      
      // Validate decimal places (max 2)
      if (value.includes('.')) {
        const decimalPlaces = value.split('.')[1]?.length || 0
        if (decimalPlaces > 2) {
          showError('Invalid Tax Percentage', 'Tax percentage can have at most 2 decimal places')
          return
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : numValue,
      }))
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }))
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showError('Error', 'Geolocation is not supported by your browser')
      return
    }

    setIsLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }))
        setIsLocationLoading(false)
        showSuccess('Success', 'Location updated!')
      },
      (err) => {
        setIsLocationLoading(false)
        showError('Error', `Failed to get location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    )
  }

  // Handle logo image upload
  const handleLogoUpload = (value: unknown) => {
    if (value === 'VALID_IMAGE' || value === true) {
      return
    }
    if (typeof value === 'string' && value !== 'KEEP_EXISTING') {
      setLogoBase64(value)
    } else if (value === null) {
      setLogoBase64('')
      setFormData((prev) => ({ ...prev, logo: '' }))
    }
  }

  // Handle banner image upload
  const handleBannerUpload = (value: unknown) => {
    if (value === 'VALID_IMAGE' || value === true) {
      return
    }
    if (typeof value === 'string' && value !== 'KEEP_EXISTING') {
      setBannerBase64(value)
    } else if (value === null) {
      setBannerBase64('')
      setFormData((prev) => ({ ...prev, banner: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id) {
      showError('Error', 'Restaurant ID is missing.')
      return
    }

    setIsSubmitting(true)

    try {
      let logoUrl = formData.logo
      let bannerUrl = formData.banner

      // Upload logo if new base64 is present
      if (logoBase64) {
        const uploadResponse = await axios.post('/api/imagekit', {
          base64Image: logoBase64,
          fileName: `restaurant_logo_${Date.now()}.jpg`,
          folder: 'restaurants',
        })

        if (uploadResponse.status === 200 && uploadResponse.data?.url) {
          logoUrl = uploadResponse.data.url

          // Delete old logo if exists
          if (formData.logo) {
            try {
              const oldFileId = extractFileIdFromUrl(formData.logo)
              if (oldFileId) {
                await axios.delete('/api/imagekit', {
                  data: { img_id: oldFileId },
                })
              }
            } catch {
              console.error('Failed to delete old logo')
            }
          }
        }
      }

      // Upload banner if new base64 is present
      if (bannerBase64) {
        const uploadResponse = await axios.post('/api/imagekit', {
          base64Image: bannerBase64,
          fileName: `restaurant_banner_${Date.now()}.jpg`,
          folder: 'restaurants',
        })

        if (uploadResponse.status === 200 && uploadResponse.data?.url) {
          bannerUrl = uploadResponse.data.url

          // Delete old banner if exists
          if (formData.banner) {
            try {
              const oldFileId = extractFileIdFromUrl(formData.banner)
              if (oldFileId) {
                await axios.delete('/api/imagekit', {
                  data: { img_id: oldFileId },
                })
              }
            } catch {
              console.error('Failed to delete old banner')
            }
          }
        }
      }

      // Submit with updated URLs using the mutation hook
      await mutation.mutateAsync({
        ...formData,
        logo: logoUrl,
        banner: bannerUrl,
      } as UpdateRestaurantParams)

      showSuccess('Success', 'Settings updated successfully!')
      setLogoBase64('')
      setBannerBase64('')
    } catch (error: any) {
      console.error('Error submitting form:', error)
      showError(
        'Error',
        error?.response?.data?.message || 'Failed to save settings',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error loading restaurant details.</p>
        <p className="text-sm">{(error as any)?.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/settings"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Restaurant Settings
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your restaurant's operational settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Status Card */}
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Power className="w-5 h-5 text-green-600" />
                Restaurant Status
              </CardTitle>
              <CardDescription>
                {formData.is_active === 1
                  ? 'Your restaurant is currently accepting orders.'
                  : 'Your restaurant is currently closed for orders.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="is_active"
                  className={`font-semibold ${formData.is_active === 1 ? 'text-green-700' : 'text-gray-500'}`}
                >
                  {formData.is_active === 1 ? 'Active' : 'Inactive'}
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active === 1}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('is_active', checked)
                  }
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Veg/Non-Veg Card */}
          <Card className="border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Restaurant Type
              </CardTitle>
              <CardDescription>
                This will be shown to customers in the user app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="is_veg_only"
                  className={`font-semibold ${formData.is_veg_only === 1 ? 'text-emerald-700' : 'text-orange-600'}`}
                >
                  {formData.is_veg_only === 1 ? 'Pure Veg' : 'Veg & Non-Veg'}
                </Label>
                <Switch
                  id="is_veg_only"
                  checked={formData.is_veg_only === 1}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('is_veg_only', checked)
                  }
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Card */}
        <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="w-5 h-5 text-amber-600" />
              Tax Settings
            </CardTitle>
            <CardDescription>
              GST or applicable tax percentage applied to orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="tax_percent" className="w-28 shrink-0">
                Tax Percentage
              </Label>
              <div className="relative flex-1 max-w-xs">
                <Input
                  id="tax_percent"
                  name="tax_percent"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={formData.tax_percent ?? ''}
                  onChange={handleInputChange}
                  className="pr-8"
                  placeholder="e.g., 5.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 ml-32">
              Enter the GST/tax rate (0-100). This will be applied to all new orders. 
              Example: 5.00 for 5% GST.
            </p>
          </CardContent>
        </Card>

        {/* Basic Details Card */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
              Basic Details
            </CardTitle>
            <CardDescription>
              Update your restaurant's public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name ?? ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number ?? ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email ?? ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description ?? ''}
                onChange={handleInputChange}
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            {/* Logo and Banner with AddImage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Restaurant Logo
                </Label>
                <AddImage
                  inputId="restaurantLogo"
                  OldImage={formData.logo || null}
                  onImageUpload={handleLogoUpload}
                  required={false}
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Restaurant Banner
                </Label>
                <AddImage
                  inputId="restaurantBanner"
                  OldImage={formData.banner || null}
                  onImageUpload={handleBannerUpload}
                  required={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address ?? ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city ?? ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state ?? ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode ?? ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="fssai_license">FSSAI License</Label>
                <Input
                  id="fssai_license"
                  name="fssai_license"
                  value={formData.fssai_license ?? ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="border-2 border-violet-200 hover:border-violet-400 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-violet-600" />
              Location
            </CardTitle>
            <CardDescription>
              Your restaurant's coordinates for map display.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  value={formData.latitude ?? ''}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  value={formData.longitude ?? ''}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={isLocationLoading}
              className="border-violet-400 text-violet-700 hover:bg-violet-50"
            >
              {isLocationLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              Get Current Location
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8"
          >
            {mutation.isPending || isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
