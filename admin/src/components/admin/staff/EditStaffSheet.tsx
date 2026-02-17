import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useUpdateStaffMutation,
  StaffMember,
} from '@/hooks/queries/useStaffQueries'

const editStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone_number: z.string().optional(),
  password: z.string().optional(),
  role: z.string(),
})

interface EditStaffSheetProps {
  staff: StaffMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStaffSheet({
  staff,
  open,
  onOpenChange,
}: EditStaffSheetProps) {
  const updateMutation = useUpdateStaffMutation()

  const form = useForm<z.infer<typeof editStaffSchema>>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: '',
      username: '',
      phone_number: '',
      password: '',
      role: '5',
    },
  })

  // Reset form when staff changes
  useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.name,
        username: staff.username || '',
        phone_number: staff.phone_number || '',
        role: staff.role.toString(),
      })
    }
  }, [staff, form])

  const onSubmit = (values: z.infer<typeof editStaffSchema>) => {
    if (!staff) return

    updateMutation.mutate(
      {
        uid: staff.uid,
        ...values,
        role: parseInt(values.role),
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 border-l-[#ead9cd] dark:border-l-primary/10 overflow-hidden flex flex-col sm:max-w-md">
        <SheetHeader className="p-6 bg-white dark:bg-[#2d1e14] border-b border-[#ead9cd] dark:border-primary/5 space-y-3">
          <SheetTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Refine Profile
          </SheetTitle>
          <SheetDescription className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest opacity-60 leading-relaxed">
            Modify credentials and access roles for{' '}
            <span className="text-orange-600">{staff?.name}</span>. Click save
            to sync changes.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
                      className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus-visible:ring-orange-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. john_d"
                      className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus-visible:ring-orange-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                    Phone Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 1234567890"
                      className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus-visible:ring-orange-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                    New Password (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus-visible:ring-orange-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                    Role
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus:ring-orange-500">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-[#ead9cd] dark:border-primary/10">
                      <SelectItem
                        value="2"
                        className="text-xs font-bold uppercase tracking-tight focus:bg-orange-50"
                      >
                        Admin
                      </SelectItem>
                      <SelectItem
                        value="3"
                        className="text-xs font-bold uppercase tracking-tight focus:bg-orange-50"
                      >
                        Restaurant Owner
                      </SelectItem>
                      <SelectItem
                        value="4"
                        className="text-xs font-bold uppercase tracking-tight focus:bg-orange-50"
                      >
                        Restaurant Manager
                      </SelectItem>
                      <SelectItem
                        value="5"
                        className="text-xs font-bold uppercase tracking-tight focus:bg-orange-50"
                      >
                        Waiter
                      </SelectItem>
                      <SelectItem
                        value="6"
                        className="text-xs font-bold uppercase tracking-tight focus:bg-orange-50"
                      >
                        Kitchen Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Sync Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60 hover:opacity-100"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
