import React from 'react'
import styled from '@emotion/styled'
import qs from 'qs'
import Papa from 'papaparse'

const TAX_RATE_LOW = 0.3
const TAX_RATE_HIGH = 0.34

const HEADERS = [
  'Timestamp',
  'Quantity',
  'Total',
  'Fees'
]

const DataFields = {
  Timestamp: 0,
  TransactionType: 1,
  Asset: 2,
  Quantity: 3,
  SpotPrice: 4,
  Subtotal: 5,
  Total: 6,
  Fees: 7,
  Notes: 8
}

const Container = styled.div({
  height: '100%',
  padding: 12,
  backgroundColor: '#2b2b2b'
})

const Header = styled.h1({
  margin: '0 0 12px',
  color: '#a1a1a1'
})

const Content = styled.div({
  minHeight: 400,
  color: '#a1a1a1'
})

const Query = styled.div({
  marginBottom: 12,
  color: '#faa1a1'
})

const InfoContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
  'span': {
    marginLeft: 8
  }
})

const DataTable = styled.table({
  marginBottom: 24
})

const queryUrl = 'https://api.coingecko.com/api/v3/coins/markets'

const queryParams = {
  vs_currency: 'eur',
  ids: ['bitcoin', 'ethereum', 'ripple', 'chainlink']
}

const query = `${queryUrl}?${qs.stringify(queryParams, { arrayFormat: 'comma' })}`

function App() {
  const fileDragArea = React.useRef()
  const [marketData, setMarketData] = React.useState()
  const [data, setData] = React.useState()

  React.useEffect(
    () => {
      fetch(query)
        .then((response) => {
          if (response.status !== 200) {
            console.log(`Something went wrong: status ${response.status}`)
          }

          response.json().then((data) => {
            console.log(data)
            const marketData = data.reduce((result, entry) => {
              result[entry.symbol] = entry
              return result
            }, {})

            setMarketData(marketData)
          })
        })
        .catch((error) => {
          console.error(error)
        })

      fileDragArea.current.ondragover = () => {
        return false
      }

      fileDragArea.current.ondragleave = () => {
        return false
      }

      fileDragArea.current.ondragend = () => {
        return false
      }

      fileDragArea.current.ondrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]

        if (!file) {
          return false
        }
        console.log(file)

        Papa.parse(file, {
          delimiter: ',',
          dynamicTyping: true,
          complete: (results) => {
            if (!results?.data) {
              console.log('No data available!')
            }
            console.log(results)

            const getRowData = (row) => {
              return {
                timestamp: new Date(row[DataFields.Timestamp]),
                transactionType: row[DataFields.TransactionType],
                asset: row[DataFields.Asset],
                quantity: row[DataFields.Quantity],
                spotPrice: row[DataFields.SpotPrice],
                total: row[DataFields.Total],
                fees: row[DataFields.Fees]
              }
            }

            const getDataSlice = (results) => {
              for (let i = 0; i < results.data.length; i++) {
                if (results.data[i][DataFields.Timestamp] === 'Timestamp') {
                  return results.data.slice(i + 1)
                }
              }

              return []
            }

            const data = getDataSlice(results).reduce((result, row) => {
              if (!row[DataFields.TransactionType]) {
                return result
              }

              const transactionType = row[DataFields.TransactionType].toLowerCase()
              const asset = row[DataFields.Asset].toLowerCase()

              if (!result[asset]) {
                result[asset] = {}
              }

              if (!result[asset][transactionType]) {
                result[asset][transactionType] = []
              }

              result[asset][transactionType].push(getRowData(row))

              return result
            }, {})

            const withTax = Object.entries(data).reduce((result, entry) => {
              const [symbol, data] = entry

              if (!data.buy || !data.sell) {
                return result
              }

              const tax = []

              const buyRowTracker = {
                index: 0,
                excess: 0,
                total: 0,
                quantity: 0
              }

              const sellRowTracker = {
                index: 0,
                excess: 0,
                total: 0,
                quantity: 0
              }

              while (true) {
                if (buyRowTracker.quantity === 0) {
                  buyRowTracker.index++

                  if (!data.buy[buyRowTracker.index]) {
                    break
                  }

                  buyRowTracker.quantity = data.buy[buyRowTracker.index].quantity
                }

                if (sellRowTracker.quantity === 0) {
                  sellRowTracker.index++

                  if (!data.sell[sellRowTracker.index]) {
                    break
                  }

                  sellRowTracker.quantity = data.sell[sellRowTracker.index].quantity
                }

                if (buyRowTracker.quantity === sellRowTracker.quantity) {
                  // const buyPrice = data.buy[buyRowTracker.index]
                  // const sellPrice = 0

                  // tax.push({
                  //   timestamp: data.sell[sellRowTracker.index].timestamp,
                  //   tax: data.buy[buyRowTracker.index]
                  // })

                  buyRowTracker.quantity = 0
                  sellRowTracker.quantity = 0

                  continue
                }

                if (buyRowTracker.quantity > sellRowTracker.quantity) {
                  tax.push({})

                  buyRowTracker.quantity - sellRowTracker.quantity
                  sellRowTracker.quantity = 0

                  continue
                }

                if (buyRowTracker.quantity < sellRowTracker.quantity) {
                  tax.push({})

                  sellRowTracker.quantity - buyRowTracker.quantity
                  buyRowTracker.quantity = 0

                  continue
                }
              }

              result[symbol] = {
                ...data,
                tax
              }

              return result
            }, {})

            setData(withTax)
          }
        })

        return false
      }
    },
    []
  )
  console.log(data)
  return (
    <Container>
      <Header>Crypto Tax</Header>
      <Content ref={fileDragArea}>
        <Query>{query}</Query>
        {/* <table>
          <thead>
            <tr>
              <th>Currency</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {marketData?.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.name}</td>
                <td>{entry.current_price}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
        {data && Object.entries(data).map((entry) => {
          // console.log(entry)
          const info = marketData?.[entry[0]]

          return (
            <React.Fragment key={entry[0]}>
              {info && (
                <InfoContainer>
                  <img alt={info.symbol} src={info.image} width={20} height={20} />
                  <span>{info.name}:</span>
                  <span>{info.current_price}</span>
                </InfoContainer>
              )}
              <DataTable>
                <thead>
                  <tr>
                    {HEADERS.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entry[1].buy?.map((entry, index) => (
                    <tr key={index}>
                      <td>{new Intl.DateTimeFormat('fi').format(entry.timestamp)}</td>
                      <td>{entry.quantity}</td>
                      <td>{entry.total}</td>
                      <td>{entry.fees}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </React.Fragment>
          )
        })}
      </Content>
    </Container>
  )
}

export default App
