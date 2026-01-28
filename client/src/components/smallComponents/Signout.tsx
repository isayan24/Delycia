import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Signout() {
  const [open, setOpen] = React.useState(false)
  const { logout } = useAuthQuery()

  const handleSignOut = async () => {
    logout()
  }

  return (
    <div className="mt-6 flex ml-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[350px] rounded-lg p-4 w-[95%] sm:w-auto border border-gray-200 shadow-md">
          <DialogHeader className="px-0 pt-0">
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between px-0 pb-0 pt-4 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleSignOut}
            >
              Yes, Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
