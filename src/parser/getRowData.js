export default function getRowData (fields, row) {
  return Object.entries(fields).reduce((result, [key, value]) => {
    result[key.charAt(0).toLowerCase() + key.substring(1)] = row[value]
    return result
  }, {})
}
