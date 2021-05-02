export default function generateDataFieldIndex (fields) {
  return fields.reduce((result, field, index) => {
    result[field] = index
    return result
  }, {})
}
