import getDataSlice from "./getDataSlice"
import getRowData from "./getRowData"

export default function getTransactionData (results, fields, validatorFields, identifier, transformer) {
  return getDataSlice(results, fields, identifier).reduce((result, row) => {
    for (const validatorField of validatorFields) {
      if (!row[validatorField]) {
        return result
      }
    }

    const rowData = getRowData(fields, row)
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
