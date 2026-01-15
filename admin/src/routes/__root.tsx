import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from 'sonner'
import { SoundProvider } from '../context/SoundContext'
import { GlobalOrderPopupManager } from '@/components/admin/orders/GlobalOrderPopupManager'
import AdminMobileNavWrapper from '@/components/smallComponents/AdminMobileNavWrapper'
import SidebarWrapper from '@/components/admin/navigation/SidebarWrapper'
import HeaderWrapper from '@/components/admin/header/HeaderWrapper'
import SidebarSwitch from '@/components/admin/header/SidebarSwitch'
import NetworkOfflineNotification from '@/components/common/NetworkOfflineNotification'
import appCss from '../styles.css?url'
import { useState } from 'react'

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
        title: 'Delycia Lab',
      },
      {
        name: 'description',
        content: 'Restaurant management system',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
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
        href: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="text-blue-600 hover:underline">
          Go back to home
        </a>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-red-600">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  ),
  component: RootComponent,
})

function RootComponent() {
  // Create QueryClient with production-ready configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ❌ Removed staleTime - let mutations control freshness via invalidation

            // Cache time: how long inactive data stays in cache
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

            // Retry failed requests
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) return false
              }
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus in production for fresh data
            refetchOnWindowFocus: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,

            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,

            // Global error handling for mutations
            onError: (error) => {
              console.error('Mutation error:', error)
              // You can add toast notification here
            },
          },
        },
      }),
  )

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        {/* <SoundProvider> */}
        <NetworkOfflineNotification />
        <HeaderWrapper />
        <div>
          <SidebarProvider className="darks">
            <SidebarWrapper />
            <SidebarSwitch />
            <SidebarInset className="relative">
              {/* body content */}
              <div className="">
                <Toaster
                  position="top-center"
                  richColors
                  closeButton
                  duration={4000}
                />
                <Outlet />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
        <AdminMobileNavWrapper />
        {/* Global Order Popup Manager */}
        {/* <GlobalOrderPopupManager /> */}
        {/* </SoundProvider> */}
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="antialiased"
      style={{ fontFamily: 'Jost, sans-serif' }}
    >
      <head>
        <HeadContent />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}

        {/* TanStack Devtools - only in development */}
        {process.env.NODE_ENV === 'development' && (
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
        )}
        <Scripts />
      </body>
    </html>
  )
}
