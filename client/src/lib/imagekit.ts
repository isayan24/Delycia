import ImageKit from 'imagekit'

/**
 * Shared ImageKit SDK instance for server-side operations
 * 
 * This instance is used for uploading and deleting images from ImageKit.
 * It requires environment variables to be set:
 * - IMAGEKIT_PUBLIC_KEY: Public API key from ImageKit dashboard
 * - IMAGEKIT_PRIVATE_KEY: Private API key (server-side only)
 * - IMAGEKIT_PUBLIC_URL_ENDPOINT: CDN URL endpoint for serving images
 */
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_PUBLIC_URL_ENDPOINT || '',
})
