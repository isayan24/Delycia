import { Button } from "@/components/ui/button";
import { PersonPinCircle } from "@mui/icons-material";
import React from "react";
import { toast } from "sonner";

export default function AddressArea() {
  return (
    <section className="opacity-40 flex flex-col gap-3 items-center border p-4 rounded-xl w-1/2 max-[700px]:w-full">
      <div className="flex items-center gap-2 bg-gray-200 shadow-md rounded-full p-3 w-fit">
        <PersonPinCircle className="!w-[40px] !h-[40px] max-[500px]:!w-[25px] max-[500px]:!h-[25px] text-gray-500" />
      </div>
      <div className="text-center">
        <address className="text-gray-800 text-[1rem]">
          No Address Saved
        </address>
        <p className="text-gray-500 text-[0.8rem] leading-3">
          Add an address so we can get tracking of your order
        </p>
      </div>
      <div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            toast.error("Location adding is currently not available");
          }}
          type="button"
          className="bg-[#c77b00] text-white hover:bg-[#c77b00]/80 max-[500px]:text-[0.8rem]"
        >
          Add New Location
        </Button>
      </div>
    </section>
  );
}
