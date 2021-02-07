const DataFields = {
  Timestamp: 0,
  TransactionType: 1,
  Asset: 2,
  Quantity: 3,
  SpotPrice: 4,
  Subtotal: 5,
  Total: 6,
  Fees: 7,
  Notes: 8
}

function getRowData (row) {
  return {
    timestamp: new Date(row[DataFields.Timestamp]),
    transactionType: row[DataFields.TransactionType],
    asset: row[DataFields.Asset],
    quantity: row[DataFields.Quantity],
    spotPrice: row[DataFields.SpotPrice],
    total: row[DataFields.Total],
    fees: row[DataFields.Fees]
  }
}

function getDataSlice (results) {
  for (let i = 0; i < results.data.length; i++) {
    if (results.data[i][DataFields.Timestamp] === 'Timestamp') {
      return results.data.slice(i + 1)
    }
  }

  return []
}

export default function getTransactionData (results) {
  return getDataSlice(results).reduce((result, row) => {
    if (!row[DataFields.TransactionType]) {
      return result
    }

    const transactionType = row[DataFields.TransactionType].toLowerCase()
    const asset = row[DataFields.Asset].toLowerCase()

    if (!result[asset]) {
      result[asset] = {}
    }

    if (!result[asset][transactionType]) {
      result[asset][transactionType] = []
    }

    result[asset][transactionType].push(getRowData(row))

    return result
  }, {})
}
