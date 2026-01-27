"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Instagram, Facebook, Twitter, Download, ArrowUp } from "lucide-react";
import Link from "@/lib/next-compat";
import { usePathname } from "@/lib/next-compat";

export default function Footer() {
  const [showFooter, setShowFooter] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const pathname = usePathname();
  const loginPage =
    pathname === "/user/sign-in" || pathname === "/user/sign-up";

  const categoryPath = pathname.startsWith("/category/");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }

      // Check if footer is in viewport
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const isFooterVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;
        setShowScrollButton(isFooterVisible);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (loginPage || categoryPath) {
    return null;
  }

  return (
    showFooter && (
      <footer className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white py-10 px-6 relative overflow-hidden mt-[3rem] ">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-gray-400 dark:border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-gray-400 dark:border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-gray-400 dark:border-white rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-5">
            {/* Logo & About Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="group">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-300 transform group-hover:scale-105">
                  {/*  eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/delycia-logo-white.png"
                    alt="Delycia Logo"
                    className=" dark:invert"
                  />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
                  {/*  eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/delycia-full.png"
                    alt="Delycia Logo"
                    className="w-auto h-12 dark:invert"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <a
                  href="#"
                  className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform"
                >
                  About Delycia
                </a>
              </div>
            </div>

            {/* Legal Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 relative">
                Legal
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="https://info.delycia.com/terms-and-conditions/"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Terms and Conditions
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://info.delycia.com/privacy-policy/"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Privacy Policy
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://info.delycia.com/cancellation-and-refund-policy/"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Cancellation and Refund Policy
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://info.delycia.com/shipping-and-delivery-policy/"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Shopping and Delivery Policy
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Delycia Food Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 relative">
                Delycia Food
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/category"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Menu
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                  >
                    Order Lookup
                    <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                  </Link>
                </li>
                 
              </ul>
            </div>

            {/* Support & Download Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 relative">
                Support
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              </h3>
              <div className="space-y-4 mb-8">
                <Link
                  href="https://info.delycia.com/contact-us/"
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform inline-block group"
                >
                  Contact Us
                  <span className="block w-0 group-hover:w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
                </Link>
              </div>

              {/* Find Location */}
              <div className="mb-8">
                <Link
                  href="#"
                  className="flex items-center text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 group"
                >
                  <div className="bg-orange-500/20 p-2 rounded-full mr-3 group-hover:bg-orange-500/30 transition-all duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Find A Delycia
                </Link>
              </div>

              {/* APK Download Button */}
              <div className="space-y-4">
                <Link href="#" className="block group">
                  <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-6 py-4 flex items-center space-x-4 hover:bg-orange-50 dark:hover:from-orange-600 dark:hover:to-red-600 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
                    <div className="bg-orange-500/20 p-3 rounded-xl group-hover:bg-orange-500/30 dark:group-hover:bg-white/20 transition-all duration-300">
                      <Download className="w-6 h-6 text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-white" />
                    </div>
                    <div className="text-gray-800 dark:text-white">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-200">
                        Download
                      </div>
                      <div className="text-lg font-bold">Delycia APK</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-300 dark:border-gray-700/50 pt-4">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center lg:text-left">
                Copyright © Delycia Corporation 2025 All rights reserved
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <Link href="#" className="group">
                  <div className="w-12 h-12 bg-white dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-transparent rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:from-orange-500 dark:hover:to-red-600 hover:border-orange-300 dark:hover:border-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Instagram className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
                <Link href="#" className="group">
                  <div className="w-12 h-12 bg-white dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-transparent rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:from-orange-500 dark:hover:to-red-600 hover:border-orange-300 dark:hover:border-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
                <Link href="#" className="group">
                  <div className="w-12 h-12 bg-white dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-transparent rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:from-orange-500 dark:hover:to-red-600 hover:border-orange-300 dark:hover:border-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button - Fixed to viewport */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-[9rem] right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 group z-50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        )}
      </footer>
    )
  );
}