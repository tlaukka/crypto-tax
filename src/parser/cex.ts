import generateDataFieldIndex from './generateDataFieldIndex'
import getTransactionData from './getTransactionData'
import { ParseResult, Transaction, TransactionData, TransactionType } from './types'

interface Row {
  amount: number,
  balance: number,
  comment: string,
  dateUTC: string,
  feeAmount: number,
  feeSymbol: string,
  pair: string,
  symbol: string,
  type: TransactionType
}

const DataFields = generateDataFieldIndex([
  'DateUTC',
  'Amount',
  'Symbol',
  'Balance',
  'Type',
  'Pair',
  'FeeSymbol',
  'FeeAmount',
  'Comment'
])

function dataTransformer (row: Row): Transaction {
  // Parse price info from the transaction notes
  const spotPrice = Number(row.comment.split(' ').slice(-2, -1))
  const subtotal = row.amount * spotPrice
  const total = subtotal + row.feeAmount

  return {
    timestamp: new Date(row.dateUTC),
    transactionType: row.type,
    asset: row.symbol,
    quantity: row.amount,
    spotPrice,
    subtotal,
    total,
    fees: row.feeAmount,
    notes: row.comment
  }
}

export default function cex (results: ParseResult): TransactionData {
  return getTransactionData<Row>(
    results,
    DataFields,
    [DataFields.Type, DataFields.Pair],
    'DateUTC',
    dataTransformer
  )
}
