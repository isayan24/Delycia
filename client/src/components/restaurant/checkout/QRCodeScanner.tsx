"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRCodeScannerProps {
  onScanSuccess: (tableNumber: string) => void;
  onClose: () => void;
  isOpen: boolean;
  onScanError?: (error: string) => void;
}

interface ScannerState {
  isScanning: boolean;
  error: string | null;
  scanResult: string | null;
  permissionDenied: boolean;
  invalidQRError: string | null;
}

export default function QRCodeScanner({
  onScanSuccess,
  onClose,
  isOpen,
  onScanError,
}: QRCodeScannerProps) {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    error: null,
    scanResult: null,
    permissionDenied: false,
    invalidQRError: null,
  });
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner on close:", err);
      }
    }
    onClose();
  };

  const handleRetryPermission = () => {
    // Reset state and trigger re-initialization
    setState({
      isScanning: false,
      error: null,
      scanResult: null,
      permissionDenied: false,
      invalidQRError: null,
    });
    
    // Force re-mount by toggling a key or manually reinitialize
    window.location.reload();
  };

  // Listen for external error updates
  useEffect(() => {
    if (onScanError) {
      // This effect allows parent to communicate errors back
      // The actual error display is handled through state
    }
  }, [onScanError]);

  useEffect(() => {
    if (!isOpen) return;

    const initializeScanner = async () => {
      try {
        setState((prev) => ({ ...prev, isScanning: true, error: null }));

        // Initialize Html5Qrcode instance
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);

        // Configure scanner settings with responsive qrbox
        const isMobile = window.innerWidth <= 768;
        const qrboxSize = isMobile ? 200 : 250;
        
        const config = {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        };

        // Start scanning with rear camera preference on mobile
        // Try environment (rear) camera first, fallback to user (front) camera
        try {
          await scannerRef.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // mark QR code detected callback
              console.log("QR Code detected:", decodedText);
              setState((prev) => ({ ...prev, scanResult: decodedText, invalidQRError: null }));
              
              // Add a brief delay to show success message before processing
              setTimeout(() => {
                onScanSuccess(decodedText);
              }, 500);
            },
            (errorMessage) => {
              // Scanning error (not critical, happens continuously)
              // We don't update state here to avoid constant re-renders
            }
          );
        } catch (rearCameraError) {
          // If rear camera fails, try front camera
          console.log("Rear camera not available, trying front camera");
          await scannerRef.current.start(
            { facingMode: "user" },
            config,
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              setState((prev) => ({ ...prev, scanResult: decodedText, invalidQRError: null }));
              setTimeout(() => {
                onScanSuccess(decodedText);
              }, 500);
            },
            (errorMessage) => {
              // Scanning error (not critical)
            }
          );
        }
      } catch (err: any) {
        console.error("Error initializing scanner:", err);
        
        // Check if error is due to permission denial
        const isPermissionError = 
          err.name === "NotAllowedError" || 
          err.message?.toLowerCase().includes("permission") ||
          err.message?.toLowerCase().includes("denied");
        
        setState((prev) => ({
          ...prev,
          isScanning: false,
          error: isPermissionError 
            ? "Camera access is required to scan QR codes. Please allow camera permission and try again."
            : err.message || "Failed to access camera. Please ensure your device has a camera.",
          permissionDenied: isPermissionError,
        }));
      }
    };

    initializeScanner();

    // Cleanup function to stop camera and release resources
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">
          Scan Table QR Code
        </h3>
      </div>

      {/* Scanner instructions */}
      <div className={`p-4 border-b dark:border-slate-700 ${
        state.invalidQRError 
          ? "bg-yellow-50 dark:bg-yellow-900/20" 
          : "bg-blue-50 dark:bg-blue-900/20"
      }`}>
        <p className={`text-sm text-center ${
          state.invalidQRError
            ? "text-yellow-800 dark:text-yellow-200"
            : "text-blue-800 dark:text-blue-200"
        }`}>
          {state.invalidQRError || "Position the QR code within the frame to scan"}
        </p>
      </div>

      {/* Camera viewfinder */}
      <div className="relative p-4">
        {!state.isScanning && !state.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Initializing camera...
              </p>
            </div>
          </div>
        )}
        
        <div 
          id={qrCodeRegionId} 
          className="w-full max-w-md mx-auto rounded-lg overflow-hidden md:max-w-sm"
        />
        
        {state.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
            <p className="text-sm text-red-800 dark:text-red-200 text-center">
              {state.error}
            </p>
            {state.permissionDenied && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleRetryPermission}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Allow Camera Access
                </button>
                <p className="text-xs text-red-700 dark:text-red-300 text-center">
                  If the button doesn&apos;t work, please check your browser settings to allow camera access for this site.
                </p>
              </div>
            )}
            {!state.permissionDenied && (
              <p className="text-xs text-red-700 dark:text-red-300 text-center">
                Please contact staff for assistance or try using a different device.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Success feedback */}
      {state.scanResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-2">
            <svg 
              className="w-5 h-5 text-green-600 dark:text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              QR Code detected! Processing...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
