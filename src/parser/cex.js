import generateDataFieldIndex from './generateDataFieldIndex'
import getTransactionData from './getTransactionData'

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

function dataTransformer (row) {
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

export default function cex (results) {
  return getTransactionData(
    results,
    DataFields,
    [DataFields.Type, DataFields.Pair],
    'DateUTC',
    dataTransformer
  )
}
