import React from 'react'
import styled from '@emotion/styled'
import Papa from 'papaparse'
import getTransactionData from './getTransactionData'
import useCryptoMarketData from './useCryptoMarketData'
import { getTax } from './addTax'
import RoundTo from './RoundTo'

// const HEADERS = [
//   'Timestamp',
//   'Quantity',
//   'Total',
//   'Fees'
// ]

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

const InfoContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
  'span': {
    marginLeft: 8
  }
})

const DataTable = styled.table({
  fontFamily: '"Lucida Console", Monaco, monospace',
  width: '100%',
  marginBottom: 24,
  borderCollapse: 'collapse',
  'thead':  {
    textAlign: 'right'
  },
  'tbody':{
    textAlign: 'right',
    backgroundColor: '#1f1f1f'
  }
})

function App() {
  const fileDragArea = React.useRef()
  const [data, setData] = React.useState()

  const { marketData } = useCryptoMarketData()

  React.useEffect(
    () => {
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

        Papa.parse(file, {
          delimiter: ',',
          dynamicTyping: true,
          complete: (results) => {
            if (!results?.data) {
              console.log('No data available!')
            }

            const data = getTransactionData(results)
            setData(data)
          }
        })

        return false
      }
    },
    []
  )

  function rendderDataTable () {
    if (!marketData) {
      return null
    }

    return (
      <DataTable>
        <thead>
          <tr>
            <th>Currency</th>
            <th>Current Price</th>
            <th>Quantity</th>
            <th>Total Buy</th>
            <th>Total Sell</th>
            <th>Profit</th>
            <th>Tax</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {data && Object.entries(data).map((entry) => {
            const currency = entry[0]
            const transaction = entry[1]
            const currencyInfo = marketData[currency]

            const buyData = transaction.buy?.reduce((result, entry) => {
              result.quantity += entry.quantity
              result.totalBuy += entry.quantity * entry.spotPrice

              return result
            }, {
              quantity: 0,
              totalBuy: 0
            })

            const totalSell = buyData.quantity * currencyInfo.current_price
            const profit = totalSell - buyData.totalBuy
            const tax = getTax(profit)
            const net = totalSell - tax

            return (
              <tr>
                <td>
                  <InfoContainer>
                    <img alt={currencyInfo.symbol} src={currencyInfo.image} width={20} height={20} />
                    <span>{currencyInfo.name}</span>
                  </InfoContainer>
                </td>
                <td>{RoundTo.currency().value(currencyInfo.current_price)}</td>
                <td>{RoundTo.f8().value(buyData.quantity)}</td>
                <td>{RoundTo.currency().value(buyData.totalBuy)}</td>
                <td>{RoundTo.currency().value(totalSell)}</td>
                <td>{RoundTo.currency().value(profit)}</td>
                <td>{RoundTo.currency().value(tax)}</td>
                <td>{RoundTo.currency().value(net)}</td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>
    )
  }

  return (
    <Container>
      <Header>Crypto Tax</Header>
      <Content ref={fileDragArea}>
        {rendderDataTable()}
      </Content>
    </Container>
  )
}

export default App
