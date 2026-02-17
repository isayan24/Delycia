import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { useCreateStaffMutation } from '@/hooks/queries/useStaffQueries'

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string(),
})

export function CreateStaffDialog() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateStaffMutation()

  const form = useForm<z.infer<typeof createStaffSchema>>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      role: '5', // Default to Waiter
    },
  })

  const onSubmit = (values: z.infer<typeof createStaffSchema>) => {
    createMutation.mutate(
      {
        ...values,
        role: parseInt(values.role),
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto gap-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest py-6 sm:py-5 px-6 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
          Add New Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-[#ead9cd] dark:border-primary/10">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Onboard New Staff
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest opacity-60">
            Configure credentials and access roles for your restaurant team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        field.name === 'name'
                          ? 'e.g. John Doe'
                          : field.name === 'username'
                            ? 'e.g. john_d'
                            : '******'
                      }
                      className="rounded-xl border-[#ead9cd] dark:border-primary/5 focus-visible:ring-orange-500 placeholder:opacity-30"
                      {...field}
                    />
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest text-[#a16b45]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-orange-500/10"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
