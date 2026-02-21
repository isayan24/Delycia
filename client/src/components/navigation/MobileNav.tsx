'use client'
import { Link } from '@tanstack/react-router'
import { usePathname } from '@/lib/next-compat'
import { useState, useEffect } from 'react'
import {
  Home,
  HomeOutlined,
  AlternateEmail,
  AlternateEmailOutlined,
  DeliveryDiningOutlined,
  DeliveryDining,
  AccountCircleOutlined,
} from '@mui/icons-material'
import { controlNavbarScroll, useNavVisibility } from '@/utils/scrollUtils'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'

export default function MobileNav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const setNavVisible = useNavVisibility((state) => state.setNavVisible)

  const { user: userData, user } = useAuthQuery()

  const { openLoginDialog } = useLoginDialogStore()

  // Client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Function to control navbar visibility on scroll
  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY

      controlNavbarScroll({
        currentScrollY,
        lastScrollY,
        setVisible,
        setLastScrollY,
      })
    }
  }

  // Update global state when component state changes
  useEffect(() => {
    setNavVisible(visible)
  }, [visible, setNavVisible])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)

      // Cleanup
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  // Don't render anything on server-side
  if (!mounted) return null

  const isOrdersActive = pathname.startsWith('/orders')
  const isDelyciasActive = pathname.startsWith('/delycias')
  const isProfileActive = pathname.startsWith('/user/p')
  const isAuthActive = pathname.startsWith('/auth')
  const isHomeActive =
    !isOrdersActive && !isDelyciasActive && !isProfileActive && !isAuthActive

  const links = [
    {
      href: '/',
      icon: Home,
      outlinedIcon: HomeOutlined,
      label: 'Home',
      active: isHomeActive,
    },
    {
      href: '/delycias',
      icon: AlternateEmail,
      outlinedIcon: AlternateEmailOutlined,
      label: 'All Delycias',
      active: isDelyciasActive,
    },
    {
      href: '/orders',
      icon: DeliveryDining,
      outlinedIcon: DeliveryDiningOutlined,
      label: 'Orders',
      active: isOrdersActive,
    },
  ]

  const onProfileClick = (e: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!user) {
      e.preventDefault()
      openLoginDialog()
    }
  }

  return (
    <div
      className={`fixed bottom-0 w-full z-50 min-[700px]:hidden max-w-[20rem]d left-1/2 -translate-x-1/2 max-[450px]:max-w-full max-[450px]:w-full border-t border-t-gray-200 bg-[#ffffff] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <section className="flex items-center justify-between gap-5 pt-2">
        {links.map((link) => (
          <Link
            to={link.href}
            key={link.href}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`${link.active ? 'border-b-4 border-[#ff8800] rounded-[5px]' : 'border-b-4 border-transparent'} flex max-[450px]:flex-col items-center justify-center gap-1 w-24 h-12`}
          >
            {link.active ? (
              <link.icon
                className={`w-7 h-7 ${link.active ? 'text-[#ff8800]' : 'text-zinc-600'}`}
              />
            ) : (
              <link.outlinedIcon
                className={`w-7 h-7 ${link.active ? 'text-[#ff8800]' : 'text-zinc-600'}`}
              />
            )}
            <p
              className={`text-xs ${link.active ? 'text-[#ff8800]' : 'text-zinc-600'}`}
            >
              {link.label}
            </p>
          </Link>
        ))}

        <Link
          to={user ? '/user/p' : '/'}
          key={'/user/p'}
          onClick={onProfileClick}
          className={`${isProfileActive ? 'border-b-4 border-[#ff8800] rounded-[5px]' : 'border-b-4 border-transparent'} flex max-[450px]:flex-col items-center justify-center gap-1 w-24 h-12`}
        >
          {userData?.profile_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userData?.profile_pic}
              alt="profile"
              className="w-6 h-6 rounded-full"
              loading="lazy"
            />
          ) : (
            <AccountCircleOutlined
              className={`w-7 h-7 ${isProfileActive ? 'text-[#ff8800]' : 'text-zinc-600'}`}
            />
          )}
          <p
            className={`text-xs ${isProfileActive ? 'text-[#ff8800]' : 'text-zinc-600'}`}
          >
            Profile
          </p>
        </Link>
      </section>
    </div>
  )
}
