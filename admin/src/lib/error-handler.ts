import { ZodError } from 'zod'
import logger from '@/lib/logger-dynamic'

// Custom error types
export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

// Helper function to parse JSON safely
export async function parseRequestBody(req: Request) {
  try {
    const body = await req.json()
    return { success: true, data: body }
  } catch (error) {
    logger.error('Invalid JSON in request body', {
      error: error,
      component: 'parseRequestBody',
    })
    return { success: false, error: 'Invalid JSON format' }
  }
}

// Validation helper
export function validateInput<T>(schema: any, data: any, component: string): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errorMessages = result.error.errors.map((err: any) => err.message)
    logger.error(`Validation failed for ${component}`, {
      errors: errorMessages,
      data,
      component,
    })
    throw new ValidationError(errorMessages)
  }

  return result.data
}

// Axios error handler
export function handleAxiosError(error: any, operation: string): Response {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.message || error.response.statusText

    logger.error(`${operation} failed - Server Error`, {
      status,
      message,
      data: error.response.data,
      component: operation,
    })

    switch (status) {
      case 401:
        return Response.json(
          { error: 'Unauthorized - Invalid access token' },
          { status: 401 },
        )
      case 403:
        return Response.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 },
        )
      case 404:
        return Response.json({ error: 'Category not found' }, { status: 404 })
      case 409:
        return Response.json(
          { error: 'Category already exists' },
          { status: 409 },
        )
      case 422:
        return Response.json(
          { error: 'Invalid data provided' },
          { status: 422 },
        )
      default:
        if (status >= 400 && status < 500) {
          return Response.json(
            { error: `Client error: ${message}` },
            { status: status },
          )
        } else {
          return Response.json(
            { error: 'External server error' },
            { status: 502 },
          )
        }
    }
  } else if (error.request) {
    // Request was made but no response received
    logger.error(`${operation} failed - Network Error`, {
      error: error.message,
      component: operation,
    })
    return Response.json(
      { error: 'Network error - Unable to connect to server' },
      { status: 503 },
    )
  } else {
    // Something else happened
    logger.error(`${operation} failed - Unknown Error`, {
      error: error.message,
      component: operation,
    })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generic error handler for the route
export function handleRouteError(error: any, component: string): Response {
  if (error instanceof ValidationError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 },
    )
  }

  if (error instanceof ParseError) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  // Handle Zod errors directly (fallback)
  if (error instanceof ZodError) {
    const errorMessages = error.errors.map((err) => err.message)
    logger.error(`Validation failed for ${component}`, {
      errors: errorMessages,
      component,
    })
    return Response.json(
      { error: 'Validation failed', details: errorMessages },
      { status: 400 },
    )
  }

  // Handle axios errors
  if (error.isAxiosError || error.response || error.request) {
    return handleAxiosError(error, component)
  }

  // Generic error fallback
  logger.error(`Unexpected error in ${component}`, {
    error: error.message,
    stack: error.stack,
    component,
  })

  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
