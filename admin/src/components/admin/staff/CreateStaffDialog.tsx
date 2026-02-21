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
        <Button className="h-9 gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold px-4 rounded-lg shadow-sm transition-all active:scale-95">
          <Plus className="h-3.5 w-3.5" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 rounded-2xl border-slate-200 dark:border-primary/10 shadow-xl">
        <DialogHeader className="space-y-1 mb-4">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Add New Staff
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed">
            Create an account with specific access roles.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
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
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Assigned Role
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-primary/5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold shadow-sm"
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
