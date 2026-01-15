// 1. StockNotificationDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { X, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import useInventoryStore from "../main-file/UseInventoryStates";

interface StockNotificationDialogProps {
  handleConfirmDate?: (
    selectedOption: string,
    variableId: string | null
  ) => void;
}

type NotificationOption = "2_hours" | "10_hours" | "24_hours" | "custom";

export const StockNotificationDialog: React.FC<
  StockNotificationDialogProps
> = ({ handleConfirmDate }) => {
  const { isRestockDialogOpen, setIsRestockDialogOpen, currentVariableId } =
    useInventoryStore();

  const [selectedOption, setSelectedOption] =
    useState<NotificationOption>("24_hours");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);

  // Set max date to 7 days from today
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  // Generate time slots (every 30 minutes from 9:00 AM to 6:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        slots.push({ value: timeString, display: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleOptionChange = (option: NotificationOption) => {
    setSelectedOption(option);
    if (option === "custom") {
      setShowDateTimeDialog(true);
    }
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate) {
      setShowDateTimeDialog(false);
    }
  };

  const handleDateTimeCancel = () => {
    setShowDateTimeDialog(false);
    setSelectedOption("24_hours");
    setSelectedDate(undefined);
  };

  const handleConfirm = () => {
    const optionLabels = {
      "2_hours": "2 Hours",
      "10_hours": "10 Hours",
      "24_hours": "24 Hours",
      custom: selectedDate
        ? `Custom: ${selectedDate.toLocaleDateString()} at ${new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`
        : "Custom date & time (upto 7 days)",
    };

    // mark from here call the db and update the stock status
    const selectedLabel = optionLabels[selectedOption];
    handleConfirmDate?.(selectedLabel, currentVariableId);
    // onOpenChange?.(false);
  };

  const getConfirmationText = () => {
    if (selectedOption === "custom" && selectedDate) {
      const timeDisplay = new Date(
        `2000-01-01T${selectedTime}`
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `Selected: ${selectedDate.toLocaleDateString()} at ${timeDisplay}`;
    }
    return null;
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog
        open={isRestockDialogOpen && !showDateTimeDialog}
        onOpenChange={setIsRestockDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <DialogTitle className="text-lg font-[400] text-gray-900 flex-1 pt-1">
                Are you sure you want to turn this item out of stock?
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            {/* <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Auto turn on item after
            </p>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="notification"
                  value="2_hours"
                  checked={selectedOption === "2_hours"}
                  onChange={(e) =>
                    handleOptionChange(e.target.value as NotificationOption)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">2 Hours</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="notification"
                  value="10_hours"
                  checked={selectedOption === "10_hours"}
                  onChange={(e) =>
                    handleOptionChange(e.target.value as NotificationOption)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">10 Hours</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="notification"
                  value="24_hours"
                  checked={selectedOption === "24_hours"}
                  onChange={(e) =>
                    handleOptionChange(e.target.value as NotificationOption)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">24 Hours</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="notification"
                  value="custom"
                  checked={selectedOption === "custom"}
                  onChange={(e) =>
                    handleOptionChange(e.target.value as NotificationOption)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Custom date & time (upto 7 days)
                </span>
              </label>
            </div>
          </div> */}

            {/* Confirmation text */}
            {getConfirmationText() && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  {getConfirmationText()}
                </p>
              </div>
            )}

            <div className="mt-6">
              <Button
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2.5"
                // disabled={selectedOption === "custom" && !selectedDate}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date & Time Selection Dialog */}
      <Dialog open={showDateTimeDialog} onOpenChange={setShowDateTimeDialog}>
        <DialogContent className="sm:max-w-lg w-fit">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <button
                onClick={handleDateTimeCancel}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              Select Date & Time
            </DialogTitle>
            <button
              onClick={handleDateTimeCancel}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          <div className="space-y-6">
            {/* Calendar section */}
            <section className="flex gap-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select a date:
                </p>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > maxDate}
                    className="rounded-md border"
                  />
                  {/* mark Time slot selection */}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select time:
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-[16rem] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        selectedTime === slot.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Selected date & time preview */}
            {selectedDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Selected: {selectedDate.toLocaleDateString()} at{" "}
                  {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit", hour12: true }
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDateTimeCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDateTimeConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedDate}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
