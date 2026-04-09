import { generateCaseNumber } from '@/payload/collections/succession/Cases/utils/generateCaseNumber'
import { describe, it, expect } from 'vitest'

describe('generateCaseNumber', () => {
  it('returns a string matching SUC-YYYYMMDD-HHMM-XXXX format', () => {
    const cn = generateCaseNumber()
    expect(cn).toMatch(/^SUC-\d{8}-\d{4}-[A-Z0-9]{4}$/)
  })

  it('generates 100 unique case numbers (no collisions)', () => {
    const numbers = Array.from({ length: 100 }, () => generateCaseNumber())
    const unique = new Set(numbers)
    expect(unique.size).toBe(100)
  })

  it('uses the current date in YYYYMMDD format', () => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const expectedPrefix = `SUC-${year}${month}${day}-`
    const cn = generateCaseNumber()
    expect(cn.startsWith(expectedPrefix)).toBe(true)
  })

  it('suffix contains only uppercase letters and digits', () => {
    const cn = generateCaseNumber()
    const suffix = cn.split('-')[3]
    expect(suffix).toMatch(/^[A-Z0-9]{4}$/)
  })
})
