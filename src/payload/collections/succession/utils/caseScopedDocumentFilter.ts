/**
 * Shared filterOptions callback for document relationship pickers.
 *
 * Restricts the admin UI picker to documents that belong to the same case as the
 * parent record being edited. Used by DocumentChecklist and NotaryProcess.
 */
export const caseScopedDocumentFilter = ({
  data,
}: {
  data?: { case?: string | { id?: string } }
}) => {
  if (!data?.case) return false
  const caseId = typeof data.case === 'object' ? data.case.id : data.case
  if (!caseId) return false
  return { case: { equals: caseId } }
}
