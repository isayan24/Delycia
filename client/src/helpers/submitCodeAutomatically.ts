"use client";

import { getCookie } from "cookies-next";
import { createTempSession } from "./createTempSession";
import { UserData } from "@/services/sessionService";

export interface CodeSubmissionResult {
  success: boolean;
  error?: string;
  data?: any;
  errorType?: "validation" | "network" | "api" | "unknown";
} 

export const submitCodeAutomatically = async (
  user: UserData | null
): Promise<CodeSubmissionResult> => {
  const startTime = Date.now();

  try {
    // Validate input parameters
    if (!user) {
      console.debug("submitCodeAutomatically: No user provided");
      return {
        success: false,
        error: "User not provided",
        errorType: "validation",
      };
    }

    if (!user.id) {
      console.warn("submitCodeAutomatically: User missing ID", { user });
      return {
        success: false,
        error: "User missing ID",
        errorType: "validation",
      };
    }

    // Check for code in cookies
    const code = getCookie("code");
    if (!code) {
      console.debug("submitCodeAutomatically: No code found in cookies");
      return {
        success: false,
        error: "No code found in cookies",
        errorType: "validation",
      };
    }

    console.log("submitCodeAutomatically: Starting submission", {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    // Call existing createTempSession helper with enhanced error handling
    const result = await createTempSession(user, code);

    const duration = Date.now() - startTime;

    if (result) {
      console.log("submitCodeAutomatically: Success", {
        userId: user.id,
        result: result,
      });
      return {
        success: true,
        data: result,
      };
    } else {
      console.warn("submitCodeAutomatically: API returned null/undefined", {
        userId: user.id,
        duration: `${duration}ms`,
      });
      return {
        success: false,
        error: "API returned no data",
        errorType: "api",
      };
    }
  } catch (error: any) {
    console.error("submitCodeAutomatically: Error occurred", {
      userId: user?.id || "unknown",
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};
