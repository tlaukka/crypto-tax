import { getTax, withCoinbaseFee } from "./addTax"

export default function useTransactionData (marketData, transactionData) {
  if (!marketData || !transactionData) {
    return []
  }

  return Object.entries(transactionData).map(([currencySymbol, transaction]) => {
    const currency = marketData[currencySymbol]

    const { quantity, totalBuy } = Object.values(transaction.buy || []).reduce((result, entry) => {
      result.quantity += entry.quantity
      result.totalBuy += entry.quantity * entry.spotPrice

      return result
    }, {
      quantity: 0,
      totalBuy: 0
    })

    const totalSell = withCoinbaseFee(quantity * currency.currentPrice)
    const profit = totalSell - totalBuy
    const tax = getTax(profit)
    const net = totalSell - tax

    return {
      currencySymbol,
      quantity,
      totalBuy,
      totalSell,
      profit,
      tax,
      net
    }
  })
}