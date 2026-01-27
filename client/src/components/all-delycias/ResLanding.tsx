'use client'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Building2,
  Star,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react'
import { ImageLoader } from '../image-loader'
import { useRestaurants } from '@/hooks/useRestaurants'
import { Link } from '@tanstack/react-router'

export default function ResLanding({ rid }: any) {
  const { restaurant, loading, error } = useRestaurants({ rid })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">
            Loading restaurant details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">Unable to load restaurant details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-[700px]:pb-10 bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-12">
          {/* Restaurant Logo & Header */}
          <div className="text-center mb-12 flex gap-3 max-[700px]:flex-col max-[700px]:gap-0">
            <div className="relative inline-block">
              {restaurant.logo ? (
                <ImageLoader
                  src={restaurant.logo}
                  alt={restaurant.name || ''}
                  width={132}
                  height={132}
                  objectFit="cover"
                  className="rounded-full mx-auto shadow-md border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto shadow-md border-4 border-white bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Building2 className="text-white text-4xl" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start max-[700px]:justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-6 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 text-lg w-fit max-[700px]:w-full">
                @{restaurant.username}
              </p>

              {/* Status Badge */}
              <div className="flex max-[700px]:justify-center mt-4">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm shadow-md ${
                    restaurant.is_active
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      restaurant.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  {restaurant.is_active ? 'Open Now' : 'Currently Closed'}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Phone className="text-orange-500 mr-2" size={24} />
                Contact Information
              </h3>

              <div className="space-y-4">
                {restaurant.phone_number && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Phone className="text-orange-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {restaurant.phone_number}
                      </p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {restaurant.email}
                      </p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="text-red-500 mr-2" size={24} />
                Location
              </h3>

              <div className="space-y-2">
                <p className="font-medium text-gray-800">
                  {restaurant.address}
                </p>
                <p className="text-gray-600">
                  {restaurant.city}, {restaurant.state} - {restaurant.pincode}
                </p>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Restaurant Type
                  </span>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      restaurant.is_veg_only
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {restaurant.is_veg_only
                      ? '🥬 Pure Veg'
                      : '🍽️ Veg & Non-Veg'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Award className="text-yellow-500 mr-3" size={28} />
              About {restaurant.name}
            </h3>

            <div className="prose max-w-none">
              {restaurant.description ? (
                <p className="text-gray-700 leading-relaxed text-lg">
                  {restaurant.description}
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {restaurant.description}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <Clock
                        className="text-orange-500 mx-auto mb-2"
                        size={24}
                      />
                      <p className="font-semibold text-gray-800">
                        Operating Hours
                      </p>
                      <p className="text-sm text-gray-600">
                        11:00 AM - 10:30 PM
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <Award
                        className="text-green-500 mx-auto mb-2"
                        size={24}
                      />
                      <p className="font-semibold text-gray-800">Since</p>
                      <p className="text-sm text-gray-600">2015</p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <Globe className="text-blue-500 mx-auto mb-2" size={24} />
                      <p className="font-semibold text-gray-800">Cuisine</p>
                      <p className="text-sm text-gray-600">Bengali & Indian</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/?rid=${restaurant.id}`}>
              <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
                <Globe size={24} />
                <span className="text-lg">View Our Menu</span>
              </button>
            </Link>

            {restaurant.phone_number && (
              <a href={`tel:${restaurant.phone_number}`}>
                <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-md border border-gray-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
                  <Phone size={24} />
                  <span className="text-lg">Call Now</span>
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
