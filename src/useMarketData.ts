import React from 'react'
import qs from 'qs'
import { CurrencyData } from './useCurrencyData'
import { TransactionByAsset } from './parser/types'

const QUERY_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets'

interface MarketEntryResponse {
  symbol: string,
  name: string,
  image: string,
  current_price: number,
  price_change_24h: number,
  price_change_percentage_24h: number
}

interface MarketEntry {
  symbol: string,
  name: string,
  image: string,
  currentPrice: number,
  priceChange24H: number,
  priceChangePercentage24H: number
}

export type MarketData = Record<string, MarketEntry>

function getMarketData (result: MarketData, entry: MarketEntryResponse) {
  result[entry.symbol] = {
    symbol: entry.symbol,
    name: entry.name,
    image: entry.image,
    currentPrice: entry.current_price,
    priceChange24H: entry.price_change_24h,
    priceChangePercentage24H: entry.price_change_percentage_24h
  }

  return result
}

// export default function useMarketData (currencyData: CurrencyData, transaction: TransactionByAsset, refreshRate = 60000) {
export default function useMarketData (transaction: TransactionByAsset, refreshRate = 60000) {
  const [data, setData] = React.useState<MarketData>()
  const [fetching, setFetching] = React.useState(false)
  const [error, setError] = React.useState<number>()

  React.useEffect(
    () => {
      async function fetchMarketData () {
        setFetching(true)

        const params = {
          vs_currency: 'eur',
          // ids: Object.keys(transaction).map((symbol) => currencyData[symbol].id)
          ids: ['bitcoin', 'ethereum', 'chainlink', 'ripple', 'dogecoin']
        }

        const query = `${QUERY_MARKETS}?${qs.stringify(params, { arrayFormat: 'comma' })}`
        const response = await fetch(query)

        if (response.status !== 200) {
          console.log(`Something went wrong: status ${response.status}`)
          setError(response.status)
          setFetching(false)

          return
        }

        const responseData: MarketEntryResponse[] = await response.json()
        const marketData = responseData.reduce(getMarketData, {})

        setData(marketData)
        setFetching(false)
      }

      // if (currencyData && transaction) {
      if (transaction) {
        fetchMarketData()

        const interval = setInterval(() => {
          fetchMarketData()
        }, refreshRate)

        return () => {
          clearInterval(interval)
        }
      }
    },
    // [currencyData, transaction, refreshRate]
    [transaction, refreshRate]
  )

  return {
    data,
    fetching,
    error
  }
}
