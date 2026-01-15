import { usePathname } from '@/hooks/usePathname'
import React, { useState, useEffect } from 'react'
import {
  Home,
  HomeOutlined,
  DeliveryDiningOutlined,
  DeliveryDining,
  AccountCircleOutlined,
  FastfoodOutlined,
  Fastfood,
} from '@mui/icons-material'
import { controlNavbarScroll, useNavVisibility } from '@/utils/scrollUtils'
import { getUser } from '@/helpers/user/getUser'
import { User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Link } from '@tanstack/react-router'

type UserData = { profile_pic?: string }

export default function AdminMobileNav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const setNavVisible = useNavVisibility((state) => state.setNavVisible)
  const [userData, setUserData] = useState<UserData | null>(null)

  const { user, accessToken, getValidAccessToken } = useAuth()

  // const { openLoginDialog } = useLoginDialogStore();

  useEffect(() => {
    if (accessToken) {
      getUser(accessToken)
        .then((data) => {
          setUserData(data?.user)
        })
        .catch((err) => console.error(err))
    }
  }, [accessToken])

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

  const links = [
    {
      href: '/dashboard',
      icon: Home,
      outlinedIcon: HomeOutlined,
      label: 'Home',
      active: pathname === '/dashboard',
    },
    {
      href: '/category',
      icon: Fastfood,
      outlinedIcon: FastfoodOutlined,
      label: 'Categories',
      active: pathname === '/category',
    },
    {
      href: '/orders',
      icon: DeliveryDining,
      outlinedIcon: DeliveryDiningOutlined,
      label: 'Orders',
      active: pathname === '/orders',
    },

    {
      href: '/users',
      icon: User,
      outlinedIcon: User,
      label: 'Users',
      active: pathname === '/users',
    },
  ]

  const userPath = pathname.startsWith('/user/p')
  // const onProfileClick = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  //   if (!session?.user) {
  //     openLoginDialog();
  //   }
  // };

  return (
    <div
      className={`fixed bottom-0 w-full z-50 min-[700px]:hidden max-w-[20rem]d left-1/2 -translate-x-1/2 max-[450px]:max-w-[100%] max-[450px]:w-[100%] border-t border-t-gray-200 bg-[#ffffff] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <section className="flex items-center justify-between gap-5 pt-2">
        {links.map((link) => (
          <Link
            to={link.href}
            key={link.href}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`${link.active ? 'border-b-4 border-[#ff8800] rounded-[5px]' : 'border-b-4 border-transparent'} flex max-[450px]:flex-col items-center justify-center gap-1 w-[6rem] h-[3rem]`}
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
          to={user ? '/users' : '/login'}
          key={'/user/p'}
          // onClick={onProfileClick}
          className={`${pathname === '/user/p' ? 'border-b-4 border-[#ff8800] rounded-[5px]' : 'border-b-4 border-transparent'} flex max-[450px]:flex-col items-center justify-center gap-1 w-[6rem] h-[3rem]`}
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
              className={`w-7 h-7 ${userPath ? 'text-[#ff8800]' : 'text-zinc-600'}`}
            />
          )}
          <p
            className={`text-xs ${userPath ? 'text-[#ff8800]' : 'text-zinc-600'}`}
          >
            Profile
          </p>
        </Link>
      </section>
    </div>
  )
}
