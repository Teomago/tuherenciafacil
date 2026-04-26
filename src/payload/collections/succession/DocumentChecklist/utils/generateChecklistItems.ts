import type { PayloadRequest } from 'payload'
import type { Case, Heir, Asset, DocumentChecklist } from '@/payload/payload-types'

type DocumentType = NonNullable<DocumentChecklist['documentType']>

const getDocumentTypesSet = (docs: DocumentChecklist[]): Set<DocumentType> =>
  new Set(
    docs
      .map((doc) => doc.documentType)
      .filter((value): value is DocumentType => Boolean(value)),
  )

export async function generateCaseChecklistItems(
  req: PayloadRequest,
  caseId: string,
  causante: { nombre?: string; cedula?: string } | undefined
): Promise<void> {
  const existing = await req.payload.find({
    collection: 'document-checklists',
    where: { case: { equals: caseId }, category: { equals: 'causante' }, source: { equals: 'system' } },
    depth: 0,
    req,
  })

  const existingTypes = getDocumentTypesSet(existing.docs)

  const required: Array<{ type: DocumentType; name: string }> = [
    { type: 'registro_civil', name: 'Registro Civil de Defunción del Causante' },
    { type: 'cedula', name: 'Copia de Cédula del Causante' },
  ]

  for (const reqItem of required) {
    if (!existingTypes.has(reqItem.type)) {
      await req.payload.create({
        collection: 'document-checklists',
        data: {
          case: caseId,
          name: reqItem.name,
          category: 'causante',
          documentType: reqItem.type as NonNullable<DocumentChecklist['documentType']>,
          source: 'system',
          required: true,
          status: 'pending',
          requiredForPhase: 4,
        },
        req,
      })
    }
  }
}

export async function generatePoderChecklistItem(req: PayloadRequest, caseId: string): Promise<void> {
  const existing = await req.payload.find({
    collection: 'document-checklists',
    where: { case: { equals: caseId }, documentType: { equals: 'poder' }, source: { equals: 'system' } },
    depth: 0,
    req,
  })

  if (existing.totalDocs === 0) {
    await req.payload.create({
      collection: 'document-checklists',
      data: {
        case: caseId,
        name: 'Poder de Representación Notarial',
        category: 'poder',
        documentType: 'poder',
        source: 'system',
        required: true,
        status: 'pending',
        requiredForPhase: 4,
      },
      req,
    })
  }
}

export async function generateHeirChecklistItems(req: PayloadRequest, heir: Heir): Promise<void> {
  const caseId = typeof heir.case === 'object' ? heir.case?.id : heir.case
  if (!caseId) return

  const existing = await req.payload.find({
    collection: 'document-checklists',
    where: { heir: { equals: heir.id }, source: { equals: 'system' } },
    depth: 0,
    req,
  })
  const existingTypes = getDocumentTypesSet(existing.docs)

  const required: Array<{ type: DocumentType; name: string }> = []

  if (heir.esFallecido) {
    required.push({ type: 'registro_civil', name: `Registro Civil de Defunción de ${heir.nombre}` })
  } else {
    required.push({ type: 'registro_civil', name: `Registro Civil de Nacimiento de ${heir.nombre}` })
    required.push({ type: 'cedula', name: `Copia de Cédula de ${heir.nombre}` })
  }

  if (heir.esRepresentante) {
    required.push({ type: 'otro', name: `Soporte de Representación para ${heir.nombre}` })
  }

  for (const reqItem of required) {
    if (!existingTypes.has(reqItem.type)) {
      await req.payload.create({
        collection: 'document-checklists',
        data: {
          case: caseId,
          name: reqItem.name,
          category: 'heredero',
          documentType: reqItem.type as NonNullable<DocumentChecklist['documentType']>,
          source: 'system',
          heir: heir.id,
          required: true,
          status: 'pending',
          requiredForPhase: 4,
        },
        req,
      })
    }
  }
}

export async function generateAssetChecklistItems(req: PayloadRequest, asset: Asset): Promise<void> {
  const caseId = typeof asset.case === 'object' ? asset.case?.id : asset.case
  if (!caseId) return

  const existing = await req.payload.find({
    collection: 'document-checklists',
    where: { asset: { equals: asset.id }, source: { equals: 'system' } },
    depth: 0,
    req,
  })
  const existingTypes = getDocumentTypesSet(existing.docs)

  const required: Array<{ type: DocumentType; name: string }> = []

  if (asset.tipo === 'inmueble') {
    required.push({ type: 'certificado_tradicion', name: `Certificado de Tradición - ${asset.identificador || asset.descripcion}` })
    required.push({ type: 'escritura', name: `Escritura Pública - ${asset.identificador || asset.descripcion}` })
  } else if (asset.tipo === 'vehiculo') {
    required.push({ type: 'otro', name: `Tarjeta de Propiedad - ${asset.identificador || asset.descripcion}` })
    required.push({ type: 'certificado_tradicion', name: `Certificado de Tradición - Vehículo ${asset.identificador || asset.descripcion}` })
  } else {
    required.push({ type: 'otro', name: `Soporte Documental - ${asset.descripcion}` })
  }

  for (const reqItem of required) {
    if (!existingTypes.has(reqItem.type)) {
      await req.payload.create({
        collection: 'document-checklists',
        data: {
          case: caseId,
          name: reqItem.name,
          category: 'bien',
          documentType: reqItem.type as NonNullable<DocumentChecklist['documentType']>,
          source: 'system',
          asset: asset.id,
          required: true,
          status: 'pending',
          requiredForPhase: 4,
        },
        req,
      })
    }
  }
}
