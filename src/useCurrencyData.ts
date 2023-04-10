import React from 'react'

const QUERY_COINS_LIST = 'https://api.coingecko.com/api/v3/coins/list'

export interface Coin {
  id: string,
  name: string,
  symbol: string
}

export type CurrencyData = Record<string, Coin>

function getCurrencyData (result: CurrencyData, entry: Coin) {
  result[entry.symbol] = {
    ...entry,
    id: entry.id.replace('-wormhole', '')
  }

  return result
}

export default function useCurrencyData () {
  const [data, setData] = React.useState<CurrencyData>()
  const [fetching, setFetching] = React.useState(false)
  const [error, setError] = React.useState<number>()

  React.useEffect(
    () => {
      async function fetchCurrencyData () {
        setFetching(true)
        const response = await fetch(QUERY_COINS_LIST)

        if (response.status !== 200) {
          console.log(`Something went wrong: status ${response.status}`)
          setError(response.status)
          setFetching(false)

          return
        }

        const responseData: Coin[] = await response.json()
        const currencyData = responseData.reduce(getCurrencyData, {})

        setData(currencyData)
        setFetching(false)
      }

      fetchCurrencyData()
    },
    []
  )

  return {
    data,
    fetching,
    error
  }
}
