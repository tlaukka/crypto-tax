import generateDataFieldIndex from "./generateDataFieldIndex"
import getTransactionData from "./getTransactionData"

const DataFields = generateDataFieldIndex([
  'Timestamp',
  'TransactionType',
  'Asset',
  'Quantity',
  'SpotPrice',
  'Subtotal',
  'Total',
  'Fees',
  'Notes'
])

function dataTransformer (row) {
  return {
    ...row,
    timestamp: new Date(row.timestamp),
    transactionType: row.transactionType.toLowerCase()
  }
}

export default function coinbase (results) {
  return getTransactionData(
    results,
    DataFields,
    [DataFields.TransactionType],
    'Timestamp',
    dataTransformer
  )
}
