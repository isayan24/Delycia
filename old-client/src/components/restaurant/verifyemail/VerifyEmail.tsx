// fixme no need of this component, remove it
// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { verifySchema } from "@/schemas/verifySchema";
// import { ApiResponse } from "@/types/ApiResponse";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios, { AxiosError } from "axios";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";

// import React from "react";

// export default function VerifyEmail() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();

//   // react hook form
//   const form = useForm({
//     resolver: zodResolver<z.infer<typeof verifySchema>>(verifySchema),
//   });

//   // re verification code
//   const handleResendCode = async () => {
//     const userInfoString = localStorage.getItem("userInfo");
//     const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

//     try {
//       const response = await axios.post(`/api/reverification-code`, {
//         id: params.id,
//         userInfo,
//       });
//       toast(response.data.message);
//     } catch (error) {
//       const axiosError = error as AxiosError<ApiResponse>;
//       const errorMessage =
//         axiosError.response?.data.message ?? "Failed to resend code";
//       toast(errorMessage);
//     }
//   };

//   // form submit
//   const onSubmit = async (data: z.infer<typeof verifySchema>) => {
//     try {
//       const response = await axios.post(`/api/verify-code`, {
//         id: params.id,
//         code: data.code,
//       });

//       toast(response.data.message);

//       if (response.data.success) {
//         router.replace(`/user/sign-in`);
//       }

//       // router.replace(`/user/p/${params.id}`);
//     } catch (error) {
//       const axiosError = error as AxiosError<ApiResponse>;
//       const errorMessage =
//         axiosError.response?.data.message ?? "Failed to verify user";
//       toast(errorMessage);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-2 justify-center items-center mt-10 p-2">
//       <div className="w-full max-w-md p-8  bg-white rounded-lg shadow-md">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
//             Verify Your Account
//           </h1>
//           <p className="mb-4">
//             Please enter the verification code sent to your email.
//           </p>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="code"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Verify your code</FormLabel>
//                   <FormControl>
//                     <Input placeholder="code" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit">Submit</Button>
//           </form>
//         </Form>
//       </div>
//       <p>
//         <span
//           onClick={handleResendCode}
//           className="text-blue-500 cursor-pointer font-semibold"
//         >
//           Resend
//         </span>
//         &nbsp; verification code!
//       </p>
//     </div>
//   );
// }
