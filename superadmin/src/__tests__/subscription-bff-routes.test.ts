import { describe, it, expect } from 'vitest'
import {
  getSubscriptionPlans,
  getPlanStats,
  createPlan,
  updatePlan,
  deactivatePlan,
  assignSubscription,
  getRestaurantSubscription,
  changeSubscriptionPlan,
  getSubscriptionHistory,
} from '@/lib/api/subscriptions'

describe('Subscription BFF Routes - Module Exports', () => {
  describe('Plan Management Routes', () => {
    it('should export getSubscriptionPlans', () => {
      expect(getSubscriptionPlans).toBeDefined()
      expect(typeof getSubscriptionPlans).toBe('function')
    })

    it('should export getPlanStats', () => {
      expect(getPlanStats).toBeDefined()
      expect(typeof getPlanStats).toBe('function')
    })

    it('should export createPlan', () => {
      expect(createPlan).toBeDefined()
      expect(typeof createPlan).toBe('function')
    })

    it('should export updatePlan', () => {
      expect(updatePlan).toBeDefined()
      expect(typeof updatePlan).toBe('function')
    })

    it('should export deactivatePlan', () => {
      expect(deactivatePlan).toBeDefined()
      expect(typeof deactivatePlan).toBe('function')
    })
  })

  describe('Subscription Assignment Routes', () => {
    it('should export assignSubscription', () => {
      expect(assignSubscription).toBeDefined()
      expect(typeof assignSubscription).toBe('function')
    })

    it('should export getRestaurantSubscription', () => {
      expect(getRestaurantSubscription).toBeDefined()
      expect(typeof getRestaurantSubscription).toBe('function')
    })

    it('should export changeSubscriptionPlan', () => {
      expect(changeSubscriptionPlan).toBeDefined()
      expect(typeof changeSubscriptionPlan).toBe('function')
    })

    it('should export getSubscriptionHistory', () => {
      expect(getSubscriptionHistory).toBeDefined()
      expect(typeof getSubscriptionHistory).toBe('function')
    })
  })
})
