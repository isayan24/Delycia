import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import {
  useRestaurantSettingsQuery,
  useUpdateRestaurantMutation,
  type UpdateRestaurantParams,
} from '@/hooks/queries/useRestaurantSettingsQueries'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'
import { useAuth } from '@/hooks/useAuth'
import useToast from '@/hooks/UseToast'
import { IdentitySection } from '@/components/admin/settings/restaurant/IdentitySection'
import { LogisticsSection } from '@/components/admin/settings/restaurant/LogisticsSection'
import { OperationsSection } from '@/components/admin/settings/restaurant/OperationsSection'
import { ScheduleSection } from '@/components/admin/settings/restaurant/ScheduleSection'
import { LoadingSpinner } from '@/components/smallComponents/LoadingSpinner'
import { LoadingOverlay } from '@/components/smallComponents/LoadingOverlay'

export const Route = createFileRoute('/settings/restaurant')({
  beforeLoad: requireAuth,
  component: RestaurantSettingsPage,
})

function RestaurantSettingsPage() {
  const { user } = useAuth()
  const rid = user?.selected_rid?.toString()
  const router = useRouter()

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
        latitude: restaurant.latitude || null,
        longitude: restaurant.longitude ||  null,
        phone_number: restaurant.phone_number || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        state: restaurant.state || '',
        pincode: restaurant.pincode || '',
        fssai_license: restaurant.fssai_license || '',
        online_orders: restaurant.online_orders ?? 0,
        open_time: restaurant.open_time || '00:00:00',
        close_time: restaurant.close_time || '00:00:00',
        active_days: restaurant.active_days,
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
        showError(
          'Invalid Tax Percentage',
          'Tax percentage must be between 0 and 100',
        )
        return
      }

      // Validate decimal places (max 2)
      if (value.includes('.')) {
        const decimalPlaces = value.split('.')[1]?.length || 0
        if (decimalPlaces > 2) {
          showError(
            'Invalid Tax Percentage',
            'Tax percentage can have at most 2 decimal places',
          )
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
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
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
      const updatedData = {
        ...formData,
        logo: logoUrl,
        banner: bannerUrl,
      } as UpdateRestaurantParams

      await mutation.mutateAsync(updatedData)

      showSuccess('Success', 'Settings updated successfully!')
      setLogoBase64('')
      setBannerBase64('')
      
      // Reload the entire page to reflect all changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
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
      <LoadingSpinner
        size="lg"
        message="Loading restaurant settings..."
        subtitle="Please wait a moment"
        className="h-[60vh]"
      />
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
    <div className="max-w-[58rem] mx-auto pb-12 max-[500px]:p-2 relative">
      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={mutation.isPending || isSubmitting}
        message="Saving Changes"
        subtitle="Updating your restaurant settings..."
      />

      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 md:gap-5 w-full sm:w-auto">
          <Link
            to="/settings"
            className="group flex items-center justify-center size-8 md:size-10 rounded-lg md:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Restaurant Settings
            </h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">
              Configure your restaurant's digital storefront and operations
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all px-4 md:px-6 rounded-lg md:rounded-xl text-sm md:text-base h-9 md:h-10 w-full sm:w-auto shrink-0"
        >
          {mutation.isPending || isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            <IdentitySection
              formData={formData}
              handleInputChange={handleInputChange}
              handleLogoUpload={handleLogoUpload}
              handleBannerUpload={handleBannerUpload}
            />

            <LogisticsSection
              formData={formData}
              handleInputChange={handleInputChange}
              handleGetLocation={handleGetLocation}
              isLocationLoading={isLocationLoading}
            />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            <OperationsSection
              formData={{
                ...formData,
                is_open_now: restaurant?.is_open_now,
                status_message: restaurant?.status_message,
                manual_override_date: restaurant?.manual_override_date,
              }}
              handleSwitchChange={handleSwitchChange}
            />

            <ScheduleSection formData={formData} setFormData={setFormData} />
          </div>
        </div>
      </form>
    </div>
  )
}
