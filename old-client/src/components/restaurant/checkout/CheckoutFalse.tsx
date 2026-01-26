// "use client";
// import { useItemStore } from "@/store/orderStore";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { checkoutSchema } from "@/schemas/checkoutSchema";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { X } from "lucide-react";

// export default function CheckoutFalse() {
//   //TODO:
//   // get all items from the store
//   // calculate the total price
//   // show the items in a table
//   // show the total price
//   // show the payment form
//   // show the order summary
//   // show the order details
//   // show the order history
//   const checkoutItems = useItemStore((state) => state.checkoutItems);
//   const clearOrderItems = useItemStore((state) => state.removeItem);
//   const clearOneCheckoutItem = useItemStore(
//     (state) => state.clearOneCheckoutItem
//   );
//   const selectedItems = useItemStore((state) => state.selectedItems);
//   const updateSelectedItems = useItemStore((state) => state.updateSelectedItems)
//   const router = useRouter();

//   const form = useForm<z.infer<typeof checkoutSchema>>({
//     // takes the schema with actual details
//     resolver: zodResolver(checkoutSchema),
//     defaultValues: {
//       name: "",
//       mobileNumber: "",
//     },
//   });

//   const totalBill = useMemo(() => {
//     const total = checkoutItems.reduce(
//       (acc, item) => acc + item.price * item.quantity!,
//       0
//     );
//     return total;
//   }, [checkoutItems]);

//   const handleSubmit = async (values: any) => {
//     console.log(values);
//     if (values) {
//       router.push("/order-placed");
//     }
//     clearOrderItems(checkoutItems.map((item) => item.id));
//     // clearCheckoutItems();
//   };

//   const onRemoveClick = (id: string) => {
//     clearOneCheckoutItem(id); 
//     // remove the checked state from cart if item is removed from checkout
//     let allSelectedItems = [...selectedItems];
//     allSelectedItems = allSelectedItems.filter((item) => item !== id)

//     updateSelectedItems(allSelectedItems) 
//   };

//   return (
//     <div className="flex gap-4">
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(handleSubmit)}
//           className="w-[30rem] p-5 space-y-6"
//         >
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }: any) => (
//               <FormItem>
//                 <FormLabel>Your Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="Enter your name"
//                     {...field}
//                     // disabled={isLoading}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="mobileNumber"
//             render={({ field }: any) => (
//               <FormItem>
//                 <FormLabel>Mobile number</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="Enter your mobile number"
//                     {...field}
//                     // disabled={isLoading}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 w-full"
//             type="submit"
//             // disabled={isLoading}
//           >
//             Confirm order
//           </Button>
//         </form>
//       </Form>

//       <section className="border rounded-xl p-5 space-y-4">
//         <h1 className="text-2xl">Items you have</h1>

//         {checkoutItems.length > 0 &&
//           checkoutItems.map((item) => (
//             <div key={item.id} className="rounded-xl p-3 border w-[25rem]">
//               <div className="flex justify-between">
//                 <h1>{item?.name}</h1>
//                 <h1>X {item?.quantity || 0}</h1>
//                 <h1>{(item?.quantity || 0) * item?.price}</h1>
//                 <X
//                   onClick={() => onRemoveClick(item.id)}
//                   className="rounded-full border p-1 hover:bg-red-500 hover:text-white"
//                 />
//               </div>
//             </div>
//           ))}
//         <h1 className="!mt-[4rem]">
//           Total Bill you have to paid <span>{totalBill}</span>
//         </h1>
//       </section>
//     </div>
//   );
// }
