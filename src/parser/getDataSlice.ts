import { DataRow, Field, ParseResult } from './types'

export default function getDataSlice (results: ParseResult, fields: Field, identifier: string): Array<DataRow> {
  for (let i = 0; i < results.data.length; i++) {
    if (results.data[i][fields[identifier]] === identifier) {
      return results.data.slice(i + 1)
    }
  }

  return [] as Array<DataRow>
}
