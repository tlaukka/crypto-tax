import React from 'react'
import styled from '@emotion/styled'
import qs from 'qs'
import Papa from 'papaparse'

const HEADERS = [
  'Asset',
  'Quantity Transacted',
  'EUR Spot Price at Transaction'
]

const DATA_FIELDS = {
  'Asset': { name: 'Asset', index: 3 },
  'Quantity Transacted': { name: 'Quantity Transacted', index: 4 },
  'EUR Spot Price at Transaction': { name: 'EUR Spot Price at Transaction', index: 5 }
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
  color: '#a1a1a1'
})

const Query = styled.div({
  marginBottom: 12,
  color: '#faa1a1'
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
            setMarketData(data)
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
          complete: (results) => {
            if (!results?.data) {
              console.log('No data available!')
            }
            console.log(results)

            const headers = results.data[7].reduce((result, entry, index) => {
              result[entry] = index
              return result
            }, {})

            const dataIndexes = HEADERS.map((entry) => {
              return headers[entry]
            })

            const dataTable = {}

            results.data.slice(8).forEach((row) => {

            })

            const getRowData = (row) => {

            }

            // Get relevant data
            const data = results.data.slice(8).map((row) => {
              return dataIndexes.map((index) => {
                return row[index]
              })
            })

            setData(data)
          }
        })

        return false
      }
    },
    []
  )

  return (
    <Container>
      <Header>Crypto Tax</Header>
      <Content ref={fileDragArea}>
        <Query>{query}</Query>
        <table>
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
        </table>
        {data && (
          <table>
            <thead>
              <tr>
                {HEADERS.map((entry) => (
                  <th key={entry}>{entry}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {row.map((column, j) => (
                    <td key={j}>{column}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Content>
    </Container>
  )
}

export default App
