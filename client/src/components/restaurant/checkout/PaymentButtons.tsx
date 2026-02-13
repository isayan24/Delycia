import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AssuredWorkload, PointOfSale, TapAndPlay } from '@mui/icons-material'
import useToast from '@/hooks/UseToast'

export default function PaymentButtons({ form }: any) {
  const { showInfo } = useToast()

  return (
    <section className="w-full">
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-gray-800 text-[1.3rem]">
              Payment Method
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value || 'cashOnDelivery'}
                className="flex flex-col space-y-3"
              >
                <FormItem className="flex items-center justify-between cursor-pointer">
                  <FormLabel className="text-[.9rem] font-normal flex items-center gap-2 w-full cursor-pointer">
                    <AssuredWorkload className="text-green-700 rounded-full bg-gray-200 p-[6px]" />
                    <span>Cash on Delivery</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem value="cashOnDelivery" />
                  </FormControl>
                </FormItem>
                <FormItem className="flex items-center justify-between ">
                  <FormLabel className="font-normal text-[.9rem] flex items-center gap-2  w-full cursor-pointer">
                    <PointOfSale className="text-blue-700 rounded-full bg-gray-200 p-[6px]" />
                    <span>Pay Online at Counter</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem value="payOnlineAtCounter" />
                  </FormControl>
                </FormItem>
                <FormItem className="flex items-center justify-between opacity-35">
                  <FormLabel className="font-normal text-[.9rem] flex items-center gap-2  w-full  cursor-not-allowed">
                    <TapAndPlay className="text-red-700 rounded-full bg-gray-200 p-[6px]" />
                    <span className="">Pay Online Now</span>
                  </FormLabel>
                  <FormControl className="cursor-not-allowed">
                    <RadioGroupItem
                      value="payOnlineNow"
                      className="cursor-not-allowed"
                      onClick={(e) => {
                        e.preventDefault()
                        showInfo(
                          'Not available',
                          'Pay Online Now is currently not available',
                        )
                      }}
                    />
                  </FormControl>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}
