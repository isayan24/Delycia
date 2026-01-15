import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateNameSchema } from "@/schemas/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useAuthContext } from "@/context/AuthProvider";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface UpdateDetailsProps {
  onNameSubmit: (values: z.infer<typeof updateNameSchema>) => void;
  userData: any;
  isNameSubmit: any;
}

export default function UpdateName({
  onNameSubmit,
  userData,
  isNameSubmit,
}: UpdateDetailsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<z.infer<typeof updateNameSchema>>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      username: "",
      name: "",
      // email: "",
      phone_number: "",
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        username: userData.username,
        name: userData.name,
        // email: userData.email,
        phone_number: userData?.phone_number || "",
      });
    }
  }, [userData, form]);

  const handleNameUpdate = async (values: z.infer<typeof updateNameSchema>) => {
    await onNameSubmit(values);
    setIsEditOpen(false);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleNameUpdate)}
          className=" relative shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded-lg"
        >
          <Card className="my-2 border-none">
            <CardHeader className="p-6 py-3 flex w-full gap-4 rounded-lg max-[500px]:px-2 ">
              <h1 className="text-lg max-[500px]:!text-[1rem]">Personal Information</h1>
            </CardHeader>

            <CardContent className="updateNameInputField">
              <div className="space-y-2 w-1/2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-normal text-gray-500 ml-2">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className={`${!isEditOpen ? "border-none pointer-events-none shadow-none" : ""} !text-[1.1rem] max-[500px]:!text-[.9rem]`}
                          {...field}
                          // disabled={isNameSubmit || !isEditOpen}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 w-1/2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-normal text-gray-500 ml-2">
                        Fullname
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className={`${!isEditOpen ? "border-none pointer-events-none shadow-none" : ""} !text-[1.1rem] max-[500px]:!text-[.9rem]`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardContent className="updateNameInputField">
              {/* <div className="space-y-2 w-1/2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-normal text-gray-500 ml-2">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className={`border-none pointer-events-none shadow-none !text-[1.1rem] max-[500px]:!text-[.9rem]`}
                          {...field}
                          // disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}
              <div className="space-y-2 w-1/2 rounded-lg">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="space-y-0 !border-none">
                      <FormLabel className="font-normal text-gray-500 ml-2 !border-none">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          disabled={true}
                          maxLength={10}
                          className={`${!isEditOpen ? "!border-none pointer-events-none shadow-none" : ""} !border-none !text-[1.1rem] max-[500px]:!text-[.9rem]`}
                          placeholder="Add phone number"
                          onChange={(e) => {
                            // Remove any non-numeric characters and limit to 10 digits
                            const value = e.target.value
                              .replace(/[^0-9]/g, "")
                              .slice(0, 10);
                            field.onChange(value);
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          {!isEditOpen && (
            <Button
              className="absolute top-2 right-2"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          )}

          {isEditOpen && (
            <Button
              className="absolute top-2 right-2"
              type="submit"
              variant="outline"
              disabled={isNameSubmit}
            >
              {isNameSubmit ? (
                <span className="flex gap-2 items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving</span>
                </span>
              ) : (
                "Save"
              )}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
