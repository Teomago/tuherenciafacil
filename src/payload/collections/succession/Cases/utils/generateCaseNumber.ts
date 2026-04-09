const SUFFIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomSuffix(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += SUFFIX_CHARS.charAt(Math.floor(Math.random() * SUFFIX_CHARS.length))
  }
  return result
}

export function generateCaseNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const suffix = randomSuffix(4)
  return `SUC-${year}${month}${day}-${hours}${minutes}-${suffix}`
}
