import getDataSlice from './getDataSlice'
import getRowData from './getRowData'
import { Field, ParseResult, Transaction, TransactionByAsset } from './types'

export default function getTransactionData<Type> (
  results: ParseResult,
  fields: Field,
  validatorFields: number[],
  identifier: string,
  transformer: (row: Type) => Transaction
): TransactionByAsset {
  return getDataSlice(results, fields, identifier).reduce((result, row) => {
    for (const validatorField of validatorFields) {
      if (!row[validatorField]) {
        return result
      }
    }

    const rowData = getRowData<Type>(fields, row)
    const data = transformer(rowData)
    const asset = data.asset.toLowerCase()

    if (!result[asset]) {
      result[asset] = {}
    }

    if (!result[asset][data.transactionType]) {
      result[asset][data.transactionType] = []
    }

    result[asset][data.transactionType].push(data)
    return result
  }, {})
}
