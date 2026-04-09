import { getPayload, Payload } from 'payload'
import config from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

describe('Members — field validation', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'members',
      where: { email: { contains: '@members-test.com' } },
      overrideAccess: true,
    })
  })

  // --- cedula validation ---

  it('rejects cedula containing non-numeric characters', async () => {
    await expect(
      payload.create({
        collection: 'members',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'cedula-invalid@members-test.com',
          password: 'password123',
          cedula: '123.456',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('rejects cedula shorter than 6 digits', async () => {
    await expect(
      payload.create({
        collection: 'members',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'cedula-short@members-test.com',
          password: 'password123',
          cedula: '12345',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('rejects cedula longer than 12 digits', async () => {
    await expect(
      payload.create({
        collection: 'members',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'cedula-long@members-test.com',
          password: 'password123',
          cedula: '1234567890123',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  // --- telefono validation ---

  it('rejects telefono not starting with 3', async () => {
    await expect(
      payload.create({
        collection: 'members',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'tel-invalid@members-test.com',
          password: 'password123',
          telefono: '2001234567',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('rejects telefono with fewer than 10 digits', async () => {
    await expect(
      payload.create({
        collection: 'members',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'tel-short@members-test.com',
          password: 'password123',
          telefono: '300123456',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  // --- defaults and valid creation ---

  it('creates member with valid data and verifies field defaults', async () => {
    const member = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Ana',
        lastName: 'García',
        email: 'valid-member@members-test.com',
        password: 'password123',
        cedula: '1012345678',
        telefono: '3001234567',
        ciudad: 'Bogotá',
      },
      overrideAccess: true,
    })

    expect(member.cedula).toBe('1012345678')
    expect(member.telefono).toBe('3001234567')
    expect(member.ciudad).toBe('Bogotá')
    expect(member.role).toBe('cliente')
    expect(member.isActive).toBe(true)
    expect(member.isVerified).toBe(false)
    expect(member.creditoAcumulado).toBe(0)
  })
})
