import generateDataFieldIndex from "./generateDataFieldIndex"
import getTransactionData from "./getTransactionData"
import { ParseResult, TransactionData, TransactionType } from "./types"

interface Row {
  asset: string,
  fees: number,
  notes: string,
  quantity: number,
  spotPrice: number,
  subtotal: number,
  timestamp: Date,
  total: number,
  transactionType: Lowercase<TransactionType>
}

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

export default function coinbase (results: ParseResult): TransactionData {
  return getTransactionData<Row>(
    results,
    DataFields,
    [DataFields.TransactionType],
    'Timestamp',
    dataTransformer
  )
}
