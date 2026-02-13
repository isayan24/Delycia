export interface Restaurant {
  address: string | null
  banner: string | null
  city: string
  description: string
  email: string | null
  id: number
  is_active: number | null
  is_veg_only: number | null
  latitude: number | null
  logo: string | null
  longitude: number | null
  name: string | null
  phone_number: string | null
  pincode: number | null
  state: string | null
  username: string
  tax_percent: number | null
  online_orders: number | null
  open_time: string | null
  close_time: string | null
  active_days: number | null
}
