import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/schemas/authSchema'

describe('Login Form Validation', () => {
  describe('identifier field validation', () => {
    it('should reject empty identifier', () => {
      const result = loginSchema.safeParse({
        identifier: '',
        password: 'password123',
        rememberMe: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email or username is required')
      }
    })

    it('should accept valid email', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin@example.com',
        password: 'password123',
        rememberMe: false,
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid username', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin_user',
        password: 'password123',
        rememberMe: false,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid identifier format', () => {
      const result = loginSchema.safeParse({
        identifier: 'a',
        password: 'password123',
        rememberMe: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be a valid email or username')
      }
    })

    it('should reject identifier with spaces', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin user',
        password: 'password123',
        rememberMe: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be a valid email or username')
      }
    })
  })

  describe('password field validation', () => {
    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin@example.com',
        password: '',
        rememberMe: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })

    it('should accept any non-empty password', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin@example.com',
        password: 'p',
        rememberMe: false,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('rememberMe field validation', () => {
    it('should default to false when not provided', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(false)
      }
    })

    it('should accept true value', () => {
      const result = loginSchema.safeParse({
        identifier: 'admin@example.com',
        password: 'password123',
        rememberMe: true,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(true)
      }
    })
  })

  describe('field-level error messages', () => {
    it('should provide specific error for each invalid field', () => {
      const result = loginSchema.safeParse({
        identifier: '',
        password: '',
        rememberMe: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.error.issues
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some(e => e.path[0] === 'identifier')).toBe(true)
        expect(errors.some(e => e.path[0] === 'password')).toBe(true)
      }
    })
  })
})
