import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, X, Check } from "lucide-react";
import { useCustomerSearch } from "@/components/admin/book-table/hooks/useCustomerSearch";
import { Customer } from "./QuickBillMain";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { generateUsername } from "@/helpers/user/generateUsername";

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export default function CustomerSearch({
  onSelectCustomer,
  selectedCustomer,
}: CustomerSearchProps) {
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const { searchResults, isSearching } = useCustomerSearch(nameInput);
  const [showResults, setShowResults] = useState(false);

  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Manage visibility of results
  useEffect(() => {
    if (nameInput.length > 1 && !selectedCustomer) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [nameInput, selectedCustomer]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchSectionRef.current &&
        !searchSectionRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectExisting = (user: any) => {
    const customer: Customer = {
      id: user.uid,
      name: user.name,
      phone_number: user.phone_number,
      username: user.username,
    };
    onSelectCustomer(customer);
    setNameInput("");
    setPhoneInput("");
    setShowResults(false);
    toast.success("Customer selected");
  };

  const handleManualAdd = () => {
    if (!nameInput.trim() || !phoneInput.trim()) {
      toast.error("Please enter both Name and Phone");
      return;
    }
    if (!/^[0-9]{10}$/.test(phoneInput)) {
      toast.error("Invalid phone number (10 digits required)");
      return;
    }
    const username = generateUsername(nameInput);

    const newCustomer: Customer = {
      id: "", // Empty ID indicates new/unverified user
      name: nameInput,
      phone_number: phoneInput,
      username,
    };

    onSelectCustomer(newCustomer);
    setNameInput("");
    setPhoneInput("");
    toast.success("Customer added locally");
  };

  const handleClear = () => {
    onSelectCustomer(null);
    setNameInput("");
    setPhoneInput("");
  };

  const handleNameInputFocus = () => {
    if (nameInput.length > 1 && !selectedCustomer) {
      setShowResults(true);
    }
  };

  if (selectedCustomer) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <div className="font-bold text-green-900">
              {selectedCustomer.name}
            </div>
            <div className="text-sm text-green-700">
              {selectedCustomer.phone_number}
            </div>
            {!selectedCustomer.id && (
              <span className="text-xs text-orange-600 font-medium">
                (New Customer)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-green-700 hover:text-green-900 hover:bg-green-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white shadow-sm">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase">
          Customer Details
        </Label>

        {/* Name Search Section - Ref attached here */}
        <div className="relative" ref={searchSectionRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search or Enter Name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onFocus={handleNameInputFocus}
              className="pl-10"
              autoComplete="off"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="relative">
              <Card className="absolute z-20 w-full mt-1 max-h-48 overflow-auto shadow-xl border-slate-200">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((user) => (
                        <li
                          key={user.uid}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                          onClick={() => handleSelectExisting(user)}
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.phone_number}
                            </div>
                          </div>
                          <Check className="w-3 h-3 text-gray-300" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-xs text-gray-500">
                      No existing customers found. Enter phone below to add new.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="relative">
          <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Enter Phone Number..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="pl-10"
            type="tel"
            maxLength={10}
          />
        </div>
      </div>

      <Button
        className="w-full bg-slate-900 hover:bg-slate-800"
        onClick={handleManualAdd}
        disabled={!nameInput || !phoneInput}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Add Customer
      </Button>
    </div>
  );
}
