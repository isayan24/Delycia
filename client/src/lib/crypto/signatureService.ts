// HMAC SHA256 signature service implementation

import crypto from 'node:crypto'
import logger from '../logger'
import cryptoConfig from './config'
import { OrderItem, SignatureConfig, SignatureService } from './types'

/**
 * Implementation of signature service using native Node.js crypto
 */
class CryptoSignatureService implements SignatureService {
  private config: SignatureConfig

  constructor() {
    this.config = {
      secretKey: cryptoConfig.getSecretKey(),
      algorithm: 'sha256', // Node crypto uses 'sha256', not 'HmacSHA256'
    }

    // Validate configuration on initialization
    if (!cryptoConfig.validateConfiguration()) {
      logger.error(
        'CryptoSignatureService initialized with invalid configuration',
      )
    }
  }

  /**
   * Generate HMAC SHA256 signature for order items
   * @param orderItems Array of order items to sign
   * @returns HMAC SHA256 signature string
   */
  generateOrderSignature(orderItems: OrderItem[]): string {
    try {
      // Validate input
      if (!orderItems || !Array.isArray(orderItems)) {
        const error = 'Invalid order items: must be a non-empty array'
        logger.error('Signature generation failed - invalid input', {
          orderItems: orderItems,
          type: typeof orderItems,
        })
        throw new Error(error)
      }

      if (orderItems.length === 0) {
        const error = 'Invalid order items: array cannot be empty'
        logger.error('Signature generation failed - empty array', {
          orderItemsLength: 0,
        })
        throw new Error(error)
      }

      // Validate secret key
      if (!this.config.secretKey) {
        const error = 'Crypto secret key not configured'
        logger.error('Signature generation failed - missing secret key')
        throw new Error(error)
      }

      logger.debug('Generating signature for order items', {
        itemCount: orderItems.length,
        secretKeyLength: this.config.secretKey.length,
      })

      // Normalize and stringify the order items consistently
      const stringified = JSON.stringify(orderItems)

      logger.debug('Order items stringified for signature', {
        stringifiedLength: stringified.length,
        stringifiedPreview:
          stringified.substring(0, 100) +
          (stringified.length > 100 ? '...' : ''),
      })

      // Generate HMAC SHA256 signature using native Node.js crypto
      const signature = crypto
        .createHmac(this.config.algorithm, this.config.secretKey)
        .update(stringified)
        .digest('hex')

      logger.info('Signature generated successfully', {
        signatureLength: signature.length,
        itemCount: orderItems.length,
      })

      return signature
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error('Signature generation failed', {
        error: errorMessage,
        orderItemsCount: Array.isArray(orderItems)
          ? orderItems.length
          : 'invalid',
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`Signature generation failed: ${errorMessage}`)
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
        logger.error('Signature validation failed - invalid data', {
          data: typeof data,
          dataLength: data ? data.length : 0,
        })
        return false
      }

      if (!signature || typeof signature !== 'string') {
        logger.error('Signature validation failed - invalid signature', {
          signature: typeof signature,
          signatureLength: signature ? signature.length : 0,
        })
        return false
      }

      if (!this.config.secretKey) {
        logger.error('Signature validation failed - missing secret key')
        return false
      }

      logger.debug('Validating signature', {
        dataLength: data.length,
        signatureLength: signature.length,
      })

      // Generate expected signature from the data
      const expectedSignature = crypto
        .createHmac(this.config.algorithm, this.config.secretKey)
        .update(data)
        .digest('hex')

      // Compare signatures securely using constant-time comparison
      // This protects against timing attacks
      const sourceBuffer = Buffer.from(expectedSignature)
      const targetBuffer = Buffer.from(signature)

      let isValid = false
      try {
        if (sourceBuffer.length === targetBuffer.length) {
          isValid = crypto.timingSafeEqual(sourceBuffer, targetBuffer)
        }
      } catch (e) {
        // Fallback for length mismatch or other buffer errors
        isValid = false
      }

      if (isValid) {
        logger.info('Signature validation successful')
      } else {
        logger.warn('Signature validation failed - signatures do not match', {
          expectedLength: expectedSignature.length,
          providedLength: signature.length,
        })
      }

      return isValid
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error('Signature validation error', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
      return false
    }
  }

  /**
   * Get the secret key being used (for testing purposes only)
   * @returns The secret key
   */
  getSecretKey(): string {
    return this.config.secretKey
  }
}

// Export singleton instance
export const signatureService = new CryptoSignatureService()

// Export class for testing
export { CryptoSignatureService }

// Export default instance
export default signatureService
