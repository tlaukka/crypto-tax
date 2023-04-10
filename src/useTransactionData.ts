import { getTax, withCoinbaseFee } from './addTax'
import { TransactionByAsset, TransactionData } from './parser/types'
import { MarketData } from './useMarketData'

type TransactionEntry = [string, TransactionData]

export default function useTransactionData (marketData: MarketData, transactionData: TransactionByAsset) {
  if (!transactionData) {
    return []
  }

  const entries: TransactionEntry[] = Object.entries(transactionData)

  return entries.map(([currencySymbol, transaction]) => {
    const currentPrice = marketData?.[currencySymbol]?.currentPrice || 0

    const { quantity, totalBuy } = Object.values(transaction.buy || []).reduce((result, entry) => {
      result.quantity += entry.quantity
      result.totalBuy += entry.quantity * entry.spotPrice

      return result
    }, {
      quantity: 0,
      totalBuy: 0
    })

    const totalSell = withCoinbaseFee(quantity * currentPrice)
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