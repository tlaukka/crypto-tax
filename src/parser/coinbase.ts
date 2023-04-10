import generateDataFieldIndex from './generateDataFieldIndex'
import getTransactionData from './getTransactionData'
import { ParseResult, Transaction, TransactionByAsset, TransactionType } from './types'

interface Row {
  asset: string,
  fees: number,
  notes: string,
  quantity: number,
  spotPrice: number,
  subtotal: number,
  timestamp: Date,
  total: number,
  transactionType: Uppercase<TransactionType>
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

function dataTransformer (row: Row): Transaction {
  return {
    ...row,
    timestamp: new Date(row.timestamp),
    transactionType: row.transactionType.toLowerCase() as TransactionType
  }
}

export default function coinbase (results: ParseResult): TransactionByAsset {
  return getTransactionData<Row>(
    results,
    DataFields,
    [DataFields.TransactionType],
    'Timestamp',
    dataTransformer
  )
}
