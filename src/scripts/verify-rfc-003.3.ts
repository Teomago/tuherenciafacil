import { getPayload } from 'payload'
import configPromise from '../payload/payload.config'
import 'dotenv/config'

const hasPath = (value: unknown, path: string): boolean => {
  if (!value || typeof value !== 'object') return false
  const endpoint = value as { path?: unknown }
  return endpoint.path === path
}

const hasName = (value: unknown, name: string): boolean => {
  if (!value || typeof value !== 'object') return false
  const field = value as { name?: unknown }
  return field.name === name
}

async function run() {
  console.log('--- RFC-003.3 Verification Script ---')
  
  const payload = await getPayload({ config: configPromise })

  const slugs = ['documents', 'document-checklists', 'notary-process', 'payments'] as const
  for (const slug of slugs) {
    if (payload.collections[slug as keyof typeof payload.collections]) {
      console.log(`✅ Collection ${slug} exists.`)
    } else {
      console.error(`❌ Collection ${slug} is MISSING.`)
      process.exit(1)
    }
  }

  // documents is an upload collection
  if (payload.collections.documents.config.upload) {
    console.log('✅ documents is an upload collection.')
  } else {
    console.error('❌ documents is NOT an upload collection.')
    process.exit(1)
  }

  // advance phase endpoint exists on cases
  const caseEndpoints = payload.collections.cases.config.endpoints
  if (Array.isArray(caseEndpoints) && caseEndpoints.some((endpoint) => hasPath(endpoint, '/:id/advance-phase'))) {
    console.log('✅ advance-phase endpoint exists on cases.')
  } else {
    console.error('❌ advance-phase endpoint is MISSING on cases.')
    process.exit(1)
  }

  // signed URL endpoint exists on documents
  const docEndpoints = payload.collections.documents.config.endpoints
  if (Array.isArray(docEndpoints) && docEndpoints.some((endpoint) => hasPath(endpoint, '/:id/url'))) {
    console.log('✅ signed URL endpoint exists on documents.')
  } else {
    console.error('❌ signed URL endpoint is MISSING on documents.')
    process.exit(1)
  }

  // checklist required/manual fields exist
  const checklistFields = payload.collections['document-checklists'].config.fields
  const hasSource = checklistFields.some((field) => hasName(field, 'source'))
  const hasRequired = checklistFields.some((field) => hasName(field, 'required'))
  if (hasSource && hasRequired) {
    console.log('✅ checklist source/required fields exist.')
  } else {
    console.error('❌ checklist source/required fields are MISSING.')
    process.exit(1)
  }

  // payments provider/manual fields exist
  const paymentFields = payload.collections.payments.config.fields
  const hasProvider = paymentFields.some((field) => hasName(field, 'paymentProvider'))
  const hasMethod = paymentFields.some((field) => hasName(field, 'method'))
  if (hasProvider && hasMethod) {
    console.log('✅ payments provider/method fields exist.')
  } else {
    console.error('❌ payments provider/method fields are MISSING.')
    process.exit(1)
  }

  // NotaryProcess phase groups exist
  const notaryFields = payload.collections['notary-process'].config.fields
  const groups = ['radicacion', 'respuestaNotario', 'edictos', 'dian', 'ugpp', 'firma', 'registro']
  for (const group of groups) {
    if (notaryFields.some((field) => hasName(field, group))) {
      console.log(`✅ notary-process group ${group} exists.`)
    } else {
      console.error(`❌ notary-process group ${group} is MISSING.`)
      process.exit(1)
    }
  }

  console.log('--- RFC-003.3 VERIFICATION COMPLETE: ALL PASSED ---')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
