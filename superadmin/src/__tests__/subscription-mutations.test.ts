import { describe, it, expect } from 'vitest'
import { useCreatePlanMutation } from '@/hooks/mutations/useCreatePlanMutation'
import { useUpdatePlanMutation } from '@/hooks/mutations/useUpdatePlanMutation'
import { useDeactivatePlanMutation } from '@/hooks/mutations/useDeactivatePlanMutation'
import { useAssignSubscriptionMutation } from '@/hooks/mutations/useAssignSubscriptionMutation'

describe('Subscription Mutation Hooks - Module Exports', () => {
  describe('useCreatePlanMutation', () => {
    it('should be defined and exportable', () => {
      expect(useCreatePlanMutation).toBeDefined()
      expect(typeof useCreatePlanMutation).toBe('function')
    })
  })

  describe('useUpdatePlanMutation', () => {
    it('should be defined and exportable', () => {
      expect(useUpdatePlanMutation).toBeDefined()
      expect(typeof useUpdatePlanMutation).toBe('function')
    })
  })

  describe('useDeactivatePlanMutation', () => {
    it('should be defined and exportable', () => {
      expect(useDeactivatePlanMutation).toBeDefined()
      expect(typeof useDeactivatePlanMutation).toBe('function')
    })
  })

  describe('useAssignSubscriptionMutation', () => {
    it('should be defined and exportable', () => {
      expect(useAssignSubscriptionMutation).toBeDefined()
      expect(typeof useAssignSubscriptionMutation).toBe('function')
    })
  })
})
