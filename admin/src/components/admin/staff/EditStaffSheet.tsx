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
      <SheetContent className="p-4">
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <SheetDescription>
            Make changes to the staff member's profile here. Click save when
            you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. john_d" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2">Admin</SelectItem>
                      <SelectItem value="3">Restaurant Owner</SelectItem>
                      <SelectItem value="4">Restaurant Manager</SelectItem>
                      <SelectItem value="5">Waiter</SelectItem>
                      <SelectItem value="6">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
