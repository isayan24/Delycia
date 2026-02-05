import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from 'sonner'
import { SoundProvider } from '../context/SoundContext'
import { GlobalOrderPopupManager } from '@/components/admin/orders/GlobalOrderPopupManager'
import NetworkOfflineNotification from '@/components/common/NetworkOfflineNotification'
import SessionExpiredNotification from '@/components/common/SessionExpiredNotification'
// Import QueryClient factory for cleaner code organization
import { createQueryClient } from '@/lib/queryClient'
import appCss from '../styles.css?url'
import { useState } from 'react'
import type { RouterContext } from '@/middleware/auth'
import { shouldShowUIComponents } from '@/middleware/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { useRoleBasedUI } from '@/components/user-roles/useRoleBasedUI'
import WaiterHeader from '@/components/admin/header/WaiterHeader'
import RouteBreadcrumbs from '@/components/common/RouteBreadcrumbs'
import { SubscriptionGuard } from '@/components/admin/settings/SubscriptionGuard'
import { NotificationToastManager } from '@/components/common/NotificationToastManager'
import { NotificationBell } from '@/components/common/NotificationBell'

// Note: We don't define beforeLoad here because we get auth from component
// and pass it via router instantiation in the app setup

export const Route = createRootRouteWithContext<RouterContext>()({
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
  // Get current route path to determine UI visibility
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { showHeader, showSidebar } = shouldShowUIComponents(pathname)
  const { canAccessSidebar, getHeaderType } = useRoleBasedUI()

  // Create QueryClient with production-ready configuration
  // Configuration is defined in src/lib/queryClient.ts for better maintainability
  const [queryClient] = useState(() => createQueryClient())

  const useSidebarLayout = showSidebar && canAccessSidebar

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <SoundProvider>
          <NetworkOfflineNotification />
          <SessionExpiredNotification />

          {/* Waiter Header fallback when Sidebar is not active but Header is requested (and not 'none') */}
          {!useSidebarLayout && showHeader && getHeaderType === 'minimal' && (
            <WaiterHeader />
          )}

          {useSidebarLayout ? (
            <SidebarProvider className="darks">
              <AppSidebar />
              <SidebarInset className="relative">
                <SubscriptionGuard>
                  <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                    {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                    <RouteBreadcrumbs />
                    <div className="ml-auto">
                      <NotificationBell />
                    </div>
                  </header>

                  <div className="p-5 max-[500px]:p-1 max-w-[90vw]s mx-autod borderx">
                    <Toaster
                      position="top-center"
                      richColors
                      // closeButton
                      duration={4000}
                    />
                    <Outlet />
                  </div>
                </SubscriptionGuard>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <div className="">
              <Toaster
                position="top-center"
                richColors
                // closeButton
                duration={4000}
              />
              <Outlet />
            </div>
          )}

          {/* Global Order Popup Manager */}
          <GlobalOrderPopupManager />

          {/* Notification Toast Pop-ups */}
          <NotificationToastManager />
        </SoundProvider>
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
