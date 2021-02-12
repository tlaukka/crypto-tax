import { getTax } from "./addTax"

export default function useSummaryData (transactionData) {
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
