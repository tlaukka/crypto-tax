import React from 'react'

const QUERY_COINS_LIST = 'https://api.coingecko.com/api/v3/coins/list'

function getCurrencyData (result, entry) {
  result[entry.symbol] = entry
  return result
}

export default function useCurrencyData () {
  const [data, setData] = React.useState()
  const [fetching, setFetching] = React.useState(false)
  const [error, setError] = React.useState()

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

        const responseData = await response.json()
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
