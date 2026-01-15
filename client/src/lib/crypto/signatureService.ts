// HMAC SHA256 signature service implementation

import CryptoJS from 'crypto-js'; 
import cryptoConfig from './config';
import { 
  SignatureService, 
  OrderItem, 
  SignatureConfig 
} from './types';

/**
 * Implementation of signature service using crypto-js
 */
class CryptoSignatureService implements SignatureService {
  private config: SignatureConfig;

  constructor() {
    this.config = {
      secretKey: cryptoConfig.getSecretKey(),
      algorithm: 'HmacSHA256'
    };
    
    // Validate configuration on initialization
    if (!cryptoConfig.validateConfiguration()) {
      console.error('CryptoSignatureService initialized with invalid configuration');
    }
  }

  /**
   * Generate HMAC SHA256 signature for order items
   * Follows the same pattern as the HTML demo
   * @param orderItems Array of order items to sign
   * @returns HMAC SHA256 signature string
   */
  generateOrderSignature(orderItems: OrderItem[]): string {
    try {
      // Validate input
      if (!orderItems || !Array.isArray(orderItems)) {
        const error = 'Invalid order items: must be a non-empty array';
        console.error('Signature generation failed - invalid input', { 
          orderItems: orderItems,
          type: typeof orderItems 
        });
        throw new Error(error);
      }

      if (orderItems.length === 0) {
        const error = 'Invalid order items: array cannot be empty';
        console.error('Signature generation failed - empty array', { orderItemsLength: 0 });
        throw new Error(error);
      }

      // Validate secret key
      if (!this.config.secretKey) {
        const error = 'Crypto secret key not configured';
        console.error('Signature generation failed - missing secret key');
        throw new Error(error);
      }

      console.debug('Generating signature for order items', { 
        itemCount: orderItems.length,
        secretKeyLength: this.config.secretKey.length 
      });

      // Normalize and stringify the order items consistently
      // This matches the JSON.stringify behavior from the HTML demo
      const stringified = JSON.stringify(orderItems);
      
      console.debug('Order items stringified for signature', { 
        stringifiedLength: stringified.length,
        stringifiedPreview: stringified.substring(0, 100) + (stringified.length > 100 ? '...' : '')
      });
      
      // Generate HMAC SHA256 signature using crypto-js
      const signature = CryptoJS.HmacSHA256(stringified, this.config.secretKey).toString();
      
      console.info('Signature generated successfully', { 
        signatureLength: signature.length,
        itemCount: orderItems.length 
      });
      
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Signature generation failed', { 
        error: errorMessage,
        orderItemsCount: Array.isArray(orderItems) ? orderItems.length : 'invalid',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Signature generation failed: ${errorMessage}`);
    }
  }

  /**
   * Validate a signature against data
   * @param data Original data string (should be JSON stringified order items)
   * @param signature Signature to validate
   * @returns True if signature is valid
   */
  validateSignature(data: string, signature: string): boolean {
    try {
      // Validate inputs
      if (!data || typeof data !== 'string') {
        console.error('Signature validation failed - invalid data', { 
          data: typeof data,
          dataLength: data ? data.length : 0 
        });
        return false;
      }

      if (!signature || typeof signature !== 'string') {
        console.error('Signature validation failed - invalid signature', { 
          signature: typeof signature,
          signatureLength: signature ? signature.length : 0 
        });
        return false;
      }

      if (!this.config.secretKey) {
        console.error('Signature validation failed - missing secret key');
        return false;
      }

      console.debug('Validating signature', { 
        dataLength: data.length,
        signatureLength: signature.length 
      });

      // Generate expected signature from the data
      const expectedSignature = CryptoJS.HmacSHA256(data, this.config.secretKey).toString();
      
      // Compare signatures securely
      const isValid = expectedSignature === signature;
      
      if (isValid) {
        console.info('Signature validation successful');
      } else {
        console.warn('Signature validation failed - signatures do not match', {
          expectedLength: expectedSignature.length,
          providedLength: signature.length
        });
      }
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Signature validation error', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Get the secret key being used (for testing purposes only)
   * @returns The secret key
   */
  getSecretKey(): string {
    return this.config.secretKey;
  }
}

// Export singleton instance
export const signatureService = new CryptoSignatureService();

// Export class for testing
export { CryptoSignatureService };

// Export default instance
export default signatureService;