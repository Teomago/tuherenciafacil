/**
 * Safely extracts the ID from a Payload relationship field value.
 *
 * Relationship fields can be a plain string ID, a populated object with an `id`
 * property, or null/undefined. This utility normalises all three cases into
 * either a string ID or null.
 */
export const getRelationshipId = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }
  return null
}
