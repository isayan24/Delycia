// Crypto configuration management

import logger from "../logger";
import { CryptoConfig } from "./crypto.types";

/**
 * Crypto configuration constants and environment variable management
 */
class CryptoConfigManager {
  private static instance: CryptoConfigManager;
  private config: CryptoConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Get singleton instance of configuration manager
   */
  public static getInstance(): CryptoConfigManager {
    if (!CryptoConfigManager.instance) {
      CryptoConfigManager.instance = new CryptoConfigManager();
    }
    return CryptoConfigManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): CryptoConfig {
    try {
      const secretKey = process.env.CRYPTO_SECRET_KEY;

      if (!secretKey) {
        logger.warn(
          "CRYPTO_SECRET_KEY not found in environment variables, using default"
        );
      }

      const config: CryptoConfig = {
        SECRET_KEY:
          secretKey || "iuJhefiiKxerEPPMwjjSUHRTZfumDMmqQAFGVePaNvcRkkgxvz",
        SIGNATURE_HEADER: "x-signature",
        ORDERS_ENDPOINT: "/orders",
      };

      logger.info("Crypto configuration loaded successfully", {
        hasSecretKey: !!secretKey,
        secretKeyLength: config.SECRET_KEY.length,
        signatureHeader: config.SIGNATURE_HEADER,
        ordersEndpoint: config.ORDERS_ENDPOINT,
      });

      return config;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to load crypto configuration", {
        error: errorMessage,
      });

      // Return default configuration as fallback
      return {
        SECRET_KEY: "iuJhefiiKxerEPPMwjjSUHRTZfumDMmqQAFGVePaNvcRkkgxvz",
        SIGNATURE_HEADER: "x-signature",
        ORDERS_ENDPOINT: "/orders",
      };
    }
  }

  /**
   * Get the secret key for signature generation
   */
  public getSecretKey(): string {
    return this.config.SECRET_KEY;
  }

  /**
   * Get the signature header name
   */
  public getSignatureHeader(): string {
    return this.config.SIGNATURE_HEADER;
  }

  /**
   * Get the orders API endpoint
   */
  public getOrdersEndpoint(): string {
    return this.config.ORDERS_ENDPOINT;
  }

  /**
   * Get the complete configuration object
   */
  public getConfig(): CryptoConfig {
    return { ...this.config }; // Return a copy to prevent mutation
  }

  /**
   * Validate that all required configuration is present
   */
  public validateConfiguration(): boolean {
    try {
      const isValid = !!(
        this.config.SECRET_KEY &&
        this.config.SIGNATURE_HEADER &&
        this.config.ORDERS_ENDPOINT
      );

      if (!isValid) {
        logger.error("Crypto configuration validation failed", {
          hasSecretKey: !!this.config.SECRET_KEY,
          hasSignatureHeader: !!this.config.SIGNATURE_HEADER,
          hasOrdersEndpoint: !!this.config.ORDERS_ENDPOINT,
        });
      } else {
        logger.debug("Crypto configuration validation passed");
      }

      return isValid;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Error during configuration validation", {
        error: errorMessage,
      });
      return false;
    }
  }

  /**
   * Reload configuration from environment (useful for testing)
   */
  public reloadConfiguration(): void {
    logger.info("Reloading crypto configuration");
    this.config = this.loadConfiguration();
  }
}

// Export singleton instance
export const cryptoConfig = CryptoConfigManager.getInstance();

// Export class for testing
export { CryptoConfigManager };

// Export default instance
export default cryptoConfig;
