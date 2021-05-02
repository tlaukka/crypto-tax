export default function getDataSlice (results, fields, identifier) {
  for (let i = 0; i < results.data.length; i++) {
    if (results.data[i][fields[identifier]] === identifier) {
      return results.data.slice(i + 1)
    }
  }

  return []
}
