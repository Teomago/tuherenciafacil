import { describe, it, expect, vi } from 'vitest'
import { Payments } from '@/payload/collections/succession/Payments'

describe('Payments Collection Access', () => {
  describe('read', () => {
    it('has a read access control', () => {
      expect(typeof Payments.access?.read).toBe('function')
    })
  })

  describe('create', () => {
    it('has a create access control', () => {
      expect(typeof Payments.access?.create).toBe('function')
    })
  })

  describe('update', () => {
    it('has an update access control', () => {
      expect(typeof Payments.access?.update).toBe('function')
    })
  })

  describe('delete', () => {
    it('has a delete access control', () => {
      expect(typeof Payments.access?.delete).toBe('function')
    })
  })
})
