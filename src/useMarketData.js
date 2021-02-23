import React from 'react'
import qs from 'qs'

const QUERY_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets'

function getMarketData (result, entry) {
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

export default function useMarketData (currencyData, transaction, refreshRate = 60000) {
  const [data, setData] = React.useState()
  const [fetching, setFetching] = React.useState(false)
  const [error, setError] = React.useState()

  React.useEffect(
    () => {
      async function fetchMarketData () {
        setFetching(true)

        const params = {
          vs_currency: 'eur',
          ids: Object.keys(transaction).map((symbol) => currencyData[symbol].id)
        }

        const query = `${QUERY_MARKETS}?${qs.stringify(params, { arrayFormat: 'comma' })}`
        const response = await fetch(query)

        if (response.status !== 200) {
          console.log(`Something went wrong: status ${response.status}`)
          setError(response.status)
          setFetching(false)

          return
        }

        const responseData = await response.json()
        const marketData = responseData.reduce(getMarketData, {})

        setData(marketData)
        setFetching(false)
      }

      if (currencyData && transaction) {
        fetchMarketData()

        const interval = setInterval(() => {
          fetchMarketData()
        }, refreshRate)

        return () => {
          clearInterval(interval)
        }
      }
    },
    [currencyData, transaction, refreshRate]
  )

  return {
    data,
    fetching,
    error
  }
}
