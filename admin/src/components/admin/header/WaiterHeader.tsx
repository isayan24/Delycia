import { useAuth } from '@/hooks/useAuth'
import React, { useState, useEffect } from 'react'
import { User, LogOut, Settings, Bell, ShieldCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getUser } from '@/helpers/user/getUser'
import { Link } from '@tanstack/react-router'

export default function WaiterHeader() {
  const { logout, user } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    async function fetchUser() {
      if (user) {
        getUser()
          .then((data) => {
            setUserData(data?.user)
          })
          .catch((err) => console.error(err))
      }
    }
    fetchUser()
  }, [user])

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutDialog(false)
  }

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    if (!name) return 'W'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo/Title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-lg text-gray-900">Waiter Account</h1>
              </div>
            </div>

            {/* Right Section - Notifications & Profile */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={userData?.profile_pic || '/placeholder-avatar.jpg'}
                        alt="Waiter"
                      />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {getUserInitials(userData?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none flex items-center gap-2">
                        {userData?.name || 'Waiter'}{' '}
                        <ShieldCheck className="h-4 w-4 text-blue-500 " />
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/users/p" className="text-sm leading-none">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your waiter account and redirected to
              the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
