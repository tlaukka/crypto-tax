import { getTax } from './addTax'

interface TransactionDataEntry {
  currencySymbol: string,
  quantity: number,
  totalBuy: number,
  totalSell: number,
  profit: number,
  tax: number,
  net: number
}

export default function useSummaryData (transactionData: TransactionDataEntry[]) {
  if (!transactionData) {
    return null
  }

  const { totalBuy, totalSell } = transactionData.reduce((result, transaction) => {
    result.totalBuy += transaction.totalBuy
    result.totalSell += transaction.totalSell

    return result
  }, {
    totalBuy: 0,
    totalSell: 0
  })

  const profit = totalSell - totalBuy
  const tax = getTax(profit)
  const net = totalSell - tax

  return {
    totalBuy,
    totalSell,
    profit,
    tax,
    net
  }
}
