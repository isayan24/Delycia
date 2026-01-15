import ImageKit from 'imagekit'

// Shared ImageKit SDK instance for server-side operations
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_PUBLIC_URL_ENDPOINT || '',
})
