import { getPayload } from '@/lib/payload/getPayload'

export const getActiveCasesCount = async (memberId: string): Promise<number> => {
  const payload = await getPayload()
  const result = await payload.count({
    collection: 'cases',
    where: {
      or: [{ responsable: { equals: memberId } }, { abogadoAsignado: { equals: memberId } }],
    },
    overrideAccess: true,
  })

  return result.totalDocs
}
