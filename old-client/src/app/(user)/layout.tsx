import type { Metadata } from "next";
import "../globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { Jost } from "next/font/google";

import CartWrapper from "@/components/restaurant/cart/CartWrapper";
import MobileNav from "@/components/navigation/MobileNav";
import StoreProvider from "@/context/StoreProvider";
import Footer from "@/components/footer/Footer";
import Script from "next/script";
import LoginWrapper from "@/components/smallComponents/LoginWrapper";
import HeaderWrapper from "@/components/header/HeaderWrapper";
import SmoothScrolling from "@/components/smallComponents/SmoothScrolling";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Delycia",
  description: "Delycia is a restaurant management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="darks scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="beforeInteractive"
        />
      </head>
      <AuthProvider>
        <body
          suppressHydrationWarning={true}
          className={`${jost.className} antialiased bg-[#fcfeff] dark:bg-[#1f1f1f]`}
        >
          <StoreProvider>
            <HeaderWrapper />
            {/* <HeaderHero/> */}
            {/* <ProfileHeader /> */}
            {/* body content */}
            <div className="relative min-h-screend flex flex-col">
              <Toaster position="top-center" />
              {/* <Notification /> */}
              <LoginWrapper />
              <div className="flex-grow">{children}</div>
              {/* <Footer /> */}
            </div>
            <div className="mt-[6rem]xxx">
              <CartWrapper />
            </div>
            <MobileNav />
          </StoreProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
