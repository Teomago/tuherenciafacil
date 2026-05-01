import { describe, expect, it } from 'vitest'
import en from '../../../src/messages/en.json'

describe('en.json translation completeness', () => {
  it('has all required App namespace keys', () => {
    // Header
    expect(en.App?.Header?.locale).toBeDefined()
    expect(en.App?.Header?.roleCliente).toBeDefined()
    expect(en.App?.Header?.roleAbogado).toBeDefined()

    // Sidebar
    expect(en.App?.Sidebar?.mobileDrawerTitle).toBeDefined()
    expect(en.App?.Sidebar?.mobileDrawerDescription).toBeDefined()

    // Dashboard Stubs
    expect(en.App?.Dashboard?.Stubs?.welcome).toBeDefined()
    expect(en.App?.Dashboard?.Stubs?.activeCases).toBeDefined()
    expect(en.App?.Dashboard?.Stubs?.noCases).toBeDefined()
    expect(en.App?.Dashboard?.Stubs?.noCasesDescription).toBeDefined()
    expect(en.App?.Dashboard?.Stubs?.noCasesCta).toBeDefined()

    // Errors
    expect(en.App?.Errors?.forbidden?.title).toBeDefined()
    expect(en.App?.Errors?.forbidden?.description).toBeDefined()
    expect(en.App?.Errors?.forbidden?.cta).toBeDefined()

    // CaseTabs
    expect(en.App?.CaseTabs?.notaria).toBeDefined()
  })
})
