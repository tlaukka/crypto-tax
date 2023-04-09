export default function generateDataFieldIndex<T extends string>(fields: T[]): Record<T, number> {
  return fields.reduce((result, field, index) => {
    result[field] = index
    return result
  }, {} as Record<T, number>)
}
