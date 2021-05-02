import generateDataFieldIndex from './generateDataFieldIndex'
import getTransactionData from './getTransactionData'

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

function dataTransformer (row) {
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

export default function binance (results) {
  return getTransactionData(
    results,
    DataFields,
    [DataFields.Method],
    'Date(UTC)',
    dataTransformer
  )
}
