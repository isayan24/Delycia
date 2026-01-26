import { create } from "zustand";

interface CheckoutContext {
  checkoutData?: any;
  onCheckoutComplete?: (userData: any) => void;
}

interface LoginDialogStore {
  isOpen: boolean;
  currentStep: number;
  checkoutContext?: CheckoutContext;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
  setCurrentStep: (step: number) => void;
  resetLoginDialog: () => void;
  openLoginDialogWithCheckout: (checkoutData: any, onComplete: (userData: any) => void) => void;
}

export const useLoginDialogStore = create<LoginDialogStore>((set) => ({
  isOpen: false,
  currentStep: 0,
  checkoutContext: undefined,
  openLoginDialog: () => set({ isOpen: true }),
  closeLoginDialog: () => set({ isOpen: false }),
  setCurrentStep: (step: number) => set({ currentStep: step }),
  resetLoginDialog: () => set({ isOpen: false, currentStep: 0, checkoutContext: undefined }),
  openLoginDialogWithCheckout: (checkoutData: any, onComplete: (userData: any) => void) => 
    set({ 
      isOpen: true, 
      currentStep: 2, 
      checkoutContext: { checkoutData, onCheckoutComplete: onComplete } 
    }),
}));
