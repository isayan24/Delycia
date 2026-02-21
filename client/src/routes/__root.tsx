import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

// Providers
import AuthProvider from '@/context/AuthProvider'
import StoreProvider from '@/context/StoreProvider'

// Components
import { Toaster } from '@/components/ui/sonner'
import CartWrapper from '@/components/restaurant/cart/CartWrapper'
import MobileNav from '@/components/navigation/MobileNav'
import LoginWrapper from '@/components/smallComponents/LoginWrapper'
import HeaderWrapper from '@/components/header/HeaderWrapper'
import { InitialLoader } from '@/components/loader/InitialLoader'

// Global Styles
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Delycia',
      },
      {
        name: 'description',
        content: 'Delycia is a restaurant management system',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: '/styles.css', // Ensure this matches vite output or import
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
      },
    ],
  }),

  component: RootComponent,
})

// Query imports
import { QueryClientProvider } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { createQueryClient, RouterContext } from '../router'
import { useRef } from 'react'

// ... existing code

function RootComponent() {
  // Use router's queryClient if available, otherwise create one (SSR fallback)
  const context = useRouteContext({ from: '__root__' }) as RouterContext
  const fallbackQueryClient = useRef(createQueryClient())
  const queryClient = context?.queryClient ?? fallbackQueryClient.current

  return (
    <html lang="en" className="darks scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="font-jost antialiased bg-[#fcfeff] dark:bg-[#1f1f1f]d">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StoreProvider>
              {/* <InitialLoader /> */}
              <HeaderWrapper />
              <div className="relative min-h-screen flex flex-col">
                <Toaster position="top-center" />
                <LoginWrapper />
                <div className="flex-grow">
                  <Outlet />
                </div>
              </div>
              <div className="mt-[6rem]">
                <CartWrapper />
              </div>
              <MobileNav />
            </StoreProvider>
          </AuthProvider>
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
