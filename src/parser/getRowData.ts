import { DataRow, Field } from './types'

export default function getRowData<Type>(fields: Field, row: DataRow): Type {
  return Object.entries(fields).reduce((result, [key, value]) => {
    result[key.charAt(0).toLowerCase() + key.substring(1)] = row[value]
    return result
  }, {} as Type)
}
