import generateDataFieldIndex from './generateDataFieldIndex'
import getTransactionData from './getTransactionData'
import { ParseResult, Transaction, TransactionByAsset } from './types'

interface Row {
  amount: string,
  'date(UTC)': string,
  fees: string,
  finalAmount: string,
  method: string,
  price: string,
  status: string,
  transactionId: string
}

const DataFields = generateDataFieldIndex([
  'Date(UTC)',
  'Method',
  'Amount',
  'Price',
  'Fees',
  'FinalAmount',
  'Status',
  'TransactionId'
])

function dataTransformer (row: Row): Transaction {
  const asset = row.finalAmount.split(' ')[1]
  const quantity = Number(row.finalAmount.split(' ')[0])
  const spotPrice = Number(row.price.split(' ')[0])
  const fees = Number(row.fees.split(' ')[0])
  const total = Number(row.amount.split(' ')[0])
  const subtotal = (total - fees) * spotPrice

  return {
    timestamp: new Date(row['date(UTC)']),
    transactionType: 'buy',
    asset,
    quantity,
    spotPrice,
    subtotal,
    total,
    fees,
    notes: `Bought ${quantity} ${asset} for €${row.amount} EUR`
  }
}

export default function binance (results: ParseResult): TransactionByAsset {
  return getTransactionData<Row>(
    results,
    DataFields,
    [DataFields.Method],
    'Date(UTC)',
    dataTransformer
  )
}
