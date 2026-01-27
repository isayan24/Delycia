// components/TableNotFoundCard.tsx
"use client";

import React from "react";

interface TableNotFoundCardProps {
  onScanClick?: () => void;
}

export default function TableNotFoundCard({ onScanClick }: TableNotFoundCardProps) {
  return (
    <div className="w-full mx-auto bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm p-4">
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div className="flex-none w-10 h-10 rounded-md bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            Table Number Required
          </h4>
          <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-200 leading-snug">
            Please scan your table&apos;s QR code to continue with your order. This helps us deliver your food to the right table.
          </p>
        </div>
      </div>

      {onScanClick && (
        <button
          onClick={onScanClick}
          className="mt-3 w-full px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Scan Table QR Code
        </button>
      )}
    </div>
  );
}
