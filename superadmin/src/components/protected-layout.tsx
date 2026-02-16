import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { user, logout } = useAuth()
  
  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'
    
    // Capitalize first segment
    const title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
    return title
  }

  // Format user data for Header
  const userData = {
    name: user?.name || user?.username || 'Superadmin',
    email: user?.email,
    avatar: user?.profile_pic || '/logo.png',
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header title={getPageTitle()} user={userData} onLogout={logout} />
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
