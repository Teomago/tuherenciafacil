import { getPayload, type Payload } from 'payload'

export type ShellE2eCredentials = {
  abogadoActive: { email: string; password: string }
  abogadoInactive: { email: string; password: string }
  cliente: { email: string; password: string }
}

const password = 'ShellE2e-test-Password1'

/** Avoid Drizzle push in test workers while `pnpm dev` already pushes — prevents concurrent migration races. */
async function getShellE2ePayload(): Promise<Payload> {
  process.env.PAYLOAD_DISABLE_DB_PUSH = 'true'
  const { default: config } = await import('../../src/payload/payload.config')
  return getPayload({ config })
}

function buildEmails(projectKey: string): ShellE2eCredentials {
  const safe = projectKey.replace(/[^a-zA-Z0-9-]/g, '')
  return {
    abogadoActive: { email: `shell-e2e-${safe}-abogado-active@example.com`, password },
    abogadoInactive: { email: `shell-e2e-${safe}-abogado-inactive@example.com`, password },
    cliente: { email: `shell-e2e-${safe}-cliente@example.com`, password },
  }
}

function cedulasForProject(safeKey: string) {
  let hash = 0
  for (let i = 0; i < safeKey.length; i++) {
    hash = (hash * 33 + safeKey.charCodeAt(i)) >>> 0
  }
  const digits = String(hash % 1000000).padStart(6, '0')
  return {
    cliente: `100${digits}01`,
    abogadoActive: `100${digits}02`,
    abogadoInactive: `100${digits}03`,
  } as const
}

export async function seedShellE2eMembers(projectKey: string): Promise<ShellE2eCredentials> {
  const payload: Payload = await getShellE2ePayload()
  const creds = buildEmails(projectKey)
  const safeKey = projectKey.replace(/[^a-zA-Z0-9-]/g, '')
  const cedulas = cedulasForProject(safeKey)
  const emails = [creds.abogadoActive.email, creds.abogadoInactive.email, creds.cliente.email]

  await payload.delete({
    collection: 'members',
    where: { email: { in: emails } },
    overrideAccess: true,
  })

  // @ts-expect-error Payload Local API create() options union (draft) mismatch in generated types; runtime OK
  const clienteRes = await payload.create({
    collection: 'members',
    data: {
      firstName: 'E2E',
      lastName: 'Cliente',
      email: creds.cliente.email,
      password: creds.cliente.password,
      cedula: cedulas.cliente,
      telefono: '3001234567',
      ciudad: 'Bogotá',
      role: 'cliente',
      isActive: true,
    },
    overrideAccess: true,
  })

  // @ts-expect-error Payload Local API create() options union (draft) mismatch in generated types; runtime OK
  const abogadoActiveRes = await payload.create({
    collection: 'members',
    data: {
      firstName: 'E2E',
      lastName: 'AbogadoActivo',
      email: creds.abogadoActive.email,
      password: creds.abogadoActive.password,
      cedula: cedulas.abogadoActive,
      telefono: '3001234568',
      ciudad: 'Bogotá',
      role: 'abogado',
      isActive: true,
    },
    overrideAccess: true,
  })

  // @ts-expect-error Payload Local API create() options union (draft) mismatch in generated types; runtime OK
  await payload.create({
    collection: 'members',
    data: {
      firstName: 'E2E',
      lastName: 'AbogadoInactivo',
      email: creds.abogadoInactive.email,
      password: creds.abogadoInactive.password,
      cedula: cedulas.abogadoInactive,
      telefono: '3001234569',
      ciudad: 'Bogotá',
      role: 'abogado',
      isActive: false,
    },
    overrideAccess: true,
  })

  // Delete existing cases for these members to ensure determinism
  await payload.delete({
    collection: 'cases',
    where: {
      abogadoAsignado: { equals: abogadoActiveRes.id },
    },
    overrideAccess: true,
  })

  // Seed 1 active case for the active abogado
  await payload.create({
    collection: 'cases',
    data: {
      caseNumber: `E2E-CASE-${safeKey}`,
      currentPhase: 1,
      tier: 'estandar',
      abogadoAsignado: abogadoActiveRes.id,
      responsable: clienteRes.id,
    },
    overrideAccess: true,
  })

  return creds
}

export async function teardownShellE2eMembers(creds: ShellE2eCredentials): Promise<void> {
  const payload: Payload = await getShellE2ePayload()
  const emails = [creds.abogadoActive.email, creds.abogadoInactive.email, creds.cliente.email]
  await payload.delete({
    collection: 'members',
    where: { email: { in: emails } },
    overrideAccess: true,
  })
}
