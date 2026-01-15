import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updatePasswordSchema } from "@/schemas/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface UpdateDetailsProps {
  onPasswordSubmit: (
    values: z.infer<typeof updatePasswordSchema>
  ) => Promise<{ status: number }>;
  isPasswordSubmit: any;
}

export default function UpdatePassword({
  onPasswordSubmit,
  isPasswordSubmit,
}: UpdateDetailsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    form.reset({
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handlePasswordUpdate = async (
    values: z.infer<typeof updatePasswordSchema>
  ) => {
    if (values.newPassword != values.confirmNewPassword) {
      form.setError("confirmNewPassword", {
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const res = await onPasswordSubmit(values);  
      if (res.status == 200) { 
        form.reset({
          newPassword: "",
          confirmNewPassword: "",
        });
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error("Error updating password", error);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handlePasswordUpdate)}
          className="relative mt-5 shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded-lg "
        >
          <Card className="py-2 border-none">
            <CardContent className="p-4 flex items-center justify-center gap-4 max-[500px]:px-2 max-[500px]:gap-2">
              <div className=" w-1/2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal text-gray-500 ml-2 ">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          disabled={isPasswordSubmit || !isEditOpen}
                          className="!text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className=" w-1/2">
                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal text-gray-500">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
                          {...field}
                          disabled={isPasswordSubmit || !isEditOpen}
                          className="!text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <div className="flex items-center justify-center p-4  max-[500px]:p-2">
              {!isEditOpen && (
                <Button
                  className="w-[100%] !font-[300]"
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="!w-3 !h-3" /> Change Password
                </Button>
              )}

              {isEditOpen && (
                <Button
                  className="w-[100%] bg-[#c77b00] hover:bg-[#c77b00]/80"
                  type="submit"
                  disabled={isPasswordSubmit}
                >
                  {isPasswordSubmit ? (
                    <span className="flex gap-2 items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving</span>
                    </span>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              )}
            </div>
          </Card>
          {isEditOpen && (
            <div className="absolute top-2 right-2">
              <X onClick={handleCloseEdit} className="w-6 h-6 border border-gray-300 rounded-full p-1" />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
