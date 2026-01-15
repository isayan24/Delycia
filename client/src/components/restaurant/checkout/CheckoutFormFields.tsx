// fix in here, add mobile number, if there is no user,
import React from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Input } from "@/components/ui/input"; 

export default function CheckoutFormFields({ form }: any) {
   

  return (
    <section className="space-y-5">
      <section className="flex gap-4 w-full max-[700px]:flex-col">
        <div className="w-1/2 max-[700px]:w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-[1rem] font-normal">
                  Full Name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    // disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="w-1/2 max-[700px]:w-full">
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-[1rem] font-normal">
                  Mobile Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your mobile number"
                    {...field}
                    // disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
      {/* <div className="w-full">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="text-[1rem] font-normal">
                Email Address * <span className="text-[.8rem] italic">(Please provide valid email to show your order)</span> 
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email address"
                  {...field}
                  // disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div> */}
      <div className="w-full">
        <FormField
          control={form.control}
          name="note"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="text-[1rem] font-normal">
                Add special cooking instructions{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Make it little spicy"
                  {...field}
                  // disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
