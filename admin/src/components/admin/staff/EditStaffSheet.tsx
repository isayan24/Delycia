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
      <SheetContent className="p-0 border-l-slate-100 dark:border-l-primary/5 overflow-hidden flex flex-col sm:max-w-md">
        <div className="p-6 border-b border-slate-100 dark:border-primary/5">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Edit Staff Profile
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 font-medium leading-relaxed">
              Update credentials and roles for{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {staff?.name}
              </span>
              .
            </SheetDescription>
          </SheetHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-10 rounded-lg bg-white dark:bg-[#1a110a] border-slate-200 dark:border-primary/5 focus-visible:ring-slate-400 font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="j.doe"
                          className="h-10 rounded-lg bg-white dark:bg-[#1a110a] border-slate-200 dark:border-primary/5 focus-visible:ring-slate-400 font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phone (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890"
                          className="h-10 rounded-lg bg-white dark:bg-[#1a110a] border-slate-200 dark:border-primary/5 focus-visible:ring-slate-400 font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      New Password (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Leave blank to keep current"
                        className="h-10 rounded-lg bg-white dark:bg-[#1a110a] border-slate-200 dark:border-primary/5 focus-visible:ring-slate-400 font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Assigned Role
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-[#1a110a] border-slate-200 dark:border-primary/5 focus:ring-slate-400 font-medium">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-lg border-slate-200 dark:border-primary/10 shadow-lg">
                        {[
                          { val: '2', label: 'Admin' },
                          { val: '3', label: 'Owner' },
                          { val: '4', label: 'Manager' },
                          { val: '5', label: 'Waiter' },
                          { val: '6', label: 'Kitchen' },
                        ].map((role) => (
                          <SelectItem
                            key={role.val}
                            value={role.val}
                            className="rounded-md focus:bg-slate-100 dark:focus:bg-primary/5 transition-colors"
                          >
                            <span className="text-xs font-medium uppercase tracking-tight">
                              {role.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-6 sticky bottom-0 bg-white dark:bg-[#0f0a07] mt-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold shadow-sm"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
