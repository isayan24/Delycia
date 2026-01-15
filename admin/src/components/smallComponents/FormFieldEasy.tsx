import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";

export default function FormFieldEasy({
  form,
  name,
  placeholder,
  min = 0,
  type = "text",
  icon = null,
  className,
  placeholderApply = true,
  placeholderClasses,
}: {
  form: any;
  name: string;
  placeholder?: string;
  type?: string;
  min?: number;
  icon?: React.ReactNode;
  className?: string;
  placeholderApply?: boolean;
  placeholderClasses?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      type === "number" &&
      !/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    if (type === "number") {
      const value = e.target.value.replace(/[^0-9]/g, "");
      field.onChange(value === "" ? "" : Number(value));
    } else {
      field.onChange(e.target.value);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {placeholder && placeholderApply && (
            <FormLabel className={`${placeholderClasses} text-sm`}>
              {placeholder}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {icon && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {icon}
                </div>
              )}
              <Input
                placeholder={placeholder}
                {...field}
                type={type === "number" ? "number" : type}
                onKeyDown={handleKeyDown}
                onChange={(e) => handleChange(e, field)}
                min={min}
                className={`transition-all border-input focus:border-btnColor focus:ring-btnColor ${icon ? "pl-10" : ""} ${className}`}
              />
            </div>
          </FormControl>
          <FormMessage className="text-xs font-medium" />
        </FormItem>
      )}
    />
  );
}
