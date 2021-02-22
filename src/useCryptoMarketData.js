import React from 'react'
import qs from 'qs'

const CRYPTO_QUERY_URL = 'https://api.coingecko.com/api/v3/coins/markets'

const queryParams = {
  vs_currency: 'eur',
  ids: ['bitcoin', 'ethereum', 'ripple', 'chainlink']
}

const query = `${CRYPTO_QUERY_URL}?${qs.stringify(queryParams, { arrayFormat: 'comma' })}`

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

export default function useCryptoMarketData (refreshRate = 60000) {
  const [marketData, setMarketData] = React.useState()
  const [fetching, setFetching] = React.useState(false)
  const [error, setError] = React.useState()

  React.useEffect(
    () => {
      async function fetchMarketData () {
        setFetching(true)
        const response = await fetch(query)

        if (response.status !== 200) {
          console.log(`Something went wrong: status ${response.status}`)
          setError(response.status)
          setFetching(false)

          return
        }

        const data = await response.json()
        const marketData = data.reduce(getMarketData, {})

        setMarketData(marketData)
        setFetching(false)
      }

      fetchMarketData()

      const interval = setInterval(() => {
        fetchMarketData()
      }, refreshRate)

      return () => {
        clearInterval(interval)
      }
    },
    [refreshRate]
  )

  return {
    marketData,
    fetching,
    error
  }
}
