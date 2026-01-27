"use client";
import { Check, Minus, Plus, Trash } from "lucide-react";
import Image from "@/lib/next-compat";
import React, { useEffect } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";

export default function CartItem({
  form,
  handleItemSelection,
  handleRemove,
  handleQuantityDecrease,
  handleQuantityIncrease,
  selectedItems,
  showCartItems,
}: any) {
  const cartItemUI = [
    {
      cartItemUI:
        "flex justify-between rounded-xl w-[35rem] overflow-hiddena h-[7rem] dark:text-white max-[1000px]:w-full max-[500px]:h-[5rem]",
      cartItemImageUI:
        "h-[7rem] w-[7rem] overflow-hidden rounded-xl max-[500px]:w-[5rem] max-[500px]:h-[5rem]",
      cartItemTextUI:
        "flex flex-col dark:text-white max-[500px]:py-0 max-[700px]:gap-2 ",
      cartItemName:
        "text-xl font-[500] max-[500px]:text-[15px] max-[700px]:!leading-[15px]",
      cartItemDesc:
        "max-[700px]:text-[12px] text-[13px] text-[#00000071] line-clamp-2  max-[700px]:!leading-[13px] leading-[15px] mt-1 ",

      itemRemoveBtnUI:
        "w-8 h-8 border rounded-full p-2 bg-[#0000001f] hover:bg-[#00000029] cursor-pointer active:bg-[#00000033] active:scale-95 transition-all duration-200 dark:bg-[#ffffff1f] dark:hover:bg-[#ffffff29] dark:active:bg-[#ffffff33] max-[500px]:w-5 max-[500px]:h-5 max-[500px]:p-1",

      quantityBtnUI:
        "rounded-[13px] max-[700px]:rounded-[7px] flex justify-between items-center w-[5rem] bg-[#ea580c]  max-[500px]:w-[4rem] h-7 select-none max-[500px]:h-5 text-white font-bold",

      quantityBtnIncreaseUI:
        "rounded-full transition-all duration-[0.3s] bg-transparent  text-black text-xl h-full w-[2rem] px-2 active:scale-[0.8] max-[500px]:w-[3rem] text-white font-bold",

      itemPriceUI:
        "mt-2 max-[500px]:mt-0 text-xl font-[600] max-[500px]:text-sm  ",

      smallQuantityText:
        "text-[#00000091] text-sm dark:text-[#ffffff91] mt-3 max-[500px]:text-[10px] max-[500px]:mt-0 whitespace-nowrap",
    },
  ];

  // Automatically uncheck items that are out of stock
  useEffect(() => {
    showCartItems.forEach((item: any) => {
      if (item.status === "out_of_stock" && selectedItems.includes(item.id)) {
        handleItemSelection(item.id, false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCartItems, selectedItems]);

  return (
    <Form {...form}>
      <form className="">
        {showCartItems.map((item: any) => (
          <div key={item.id}>
            <div
              className={`mt-5 relative ${
                !selectedItems.includes(item.id) ? "grayscale" : ""
              }`}
            >
              {/* mark: checkbox */}
              <section className="absolute -left-10 top-1/2 -translate-y-1/2 max-[700px]:-left-2">
                <FormField
                  control={form.control}
                  name="selectedItems"
                  render={({ field }) => (
                    <FormItem className="flex items-center ml-2">
                      <FormControl className="">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className={`w-5 h-5 rounded-full appearance-none border border-gray-300 checked:bg-blue-500 checked:border-transparent ${
                              item.status === "out_of_stock"
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (item.status !== "out_of_stock") {
                                handleItemSelection(item.id, e.target.checked);
                              }
                            }}
                            disabled={item.status === "out_of_stock"}
                          />
                          {selectedItems.includes(item.id) && (
                            <Check className="absolute w-3 h-3 stroke-[5] text-white pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
              <main className={`${cartItemUI[0].cartItemUI} `}>
                <div className="flex gap-4 max-[700px]:ml-6">
                  <section
                    className={`${cartItemUI[0].cartItemImageUI} shrink-0 select-none`}
                  >
                    {/* mark image */} 
                    <UseOptimizeImage
                      src={item?.images[0]}
                      alt={item?.name || "burger"}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full select-none"
                      loading="lazy"
                    />
                  </section>

                  <section
                    className={`${cartItemUI[0].cartItemTextUI} max-[500px]:gap-2 `}
                  >
                    {/* texts */}
                    <div>
                      <h1 className={`${cartItemUI[0].cartItemName}`}>
                        {item?.name}
                      </h1>
                      <p className={`${cartItemUI[0].cartItemDesc}`}>
                        {item?.description}
                      </p>
                      {item.status === "out_of_stock" && (
                        <span className="text-red-500 font-medium text-sm">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <section className="flex items-center gap-2 mt-4 max-[500px]:mt-1">
                      <div
                        className={`${cartItemUI[0].quantityBtnUI} ${
                          item.status === "out_of_stock" ? "opacity-50" : ""
                        }`}
                      >
                        {item.quantity > 1 ? (
                          <Minus
                            onClick={() =>
                              item.status !== "out_of_stock" &&
                              handleQuantityDecrease(item.id)
                            }
                            className={`${cartItemUI[0].quantityBtnIncreaseUI} 
                          hover:bg-gradient-to-r ${item.status === "out_of_stock" ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                          />
                        ) : (
                          <Trash
                            onClick={() => handleRemove(item.id)}
                            className={`${cartItemUI[0].quantityBtnIncreaseUI} my-auto hover:bg-gradient-to-r max-[500px]:!w-[2.8rem]`}
                          />
                        )}

                        <span className="dark:text-black max-[500px]:text-[12px]">
                          {item.quantity}
                        </span>
                        <Plus
                          onClick={() =>
                            item.status !== "out_of_stock" &&
                            handleQuantityIncrease(item.id)
                          }
                          className={`${cartItemUI[0].quantityBtnIncreaseUI} hover:bg-gradient-to-l ${
                            item.status === "out_of_stock"
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        />
                      </div>
                      {item.discount > 0 && (
                        <h1
                          className={`border rounded-md p-2 py-0 bg-green-200 border-green-500 text-green-600 text-xs text-nowrap max-[700px]:text-[10px]`}
                        >
                          {item.discount}% OFF
                        </h1>
                      )}
                    </section>
                  </section>
                </div>

                <section className="h-full flex flex-col items-center pl-3 select-none">
                  <h2 className={`${cartItemUI[0].smallQuantityText}`}>
                    Quantity: x{item.quantity}
                  </h2>
                  <h1 className={`${cartItemUI[0].itemPriceUI}`}>
                    ₹{item.price * item.quantity}
                  </h1>
                </section>
              </main>
            </div>
            <hr className="w-[35rem] mt-6 dark:border-gray-600 max-[700px]:w-[80%] mx-auto" />
          </div>
        ))}
      </form>
    </Form>
  );
}
