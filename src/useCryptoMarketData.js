import React from 'react'
import qs from 'qs'

const CRYPTO_QUERY_URL = 'https://api.coingecko.com/api/v3/coins/markets'

const queryParams = {
  vs_currency: 'eur',
  ids: ['bitcoin', 'ethereum', 'ripple', 'chainlink']
}

const query = `${CRYPTO_QUERY_URL}?${qs.stringify(queryParams, { arrayFormat: 'comma' })}`

export default function useCryptoMarketData () {
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

        const marketData = data.reduce((result, entry) => {
          result[entry.symbol] = entry
          return result
        }, {})

        setMarketData(marketData)
        setFetching(false)
      }

      fetchMarketData()
    },
    []
  )

  return {
    marketData,
    fetching,
    error
  }
}
