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

const COLOR_FOREGROUND = '#DFE1E8'
const COLOR_BACKGROUND_LIGHT = '#2B303B'
// const COLOR_BACKGROUND_DARK = '#21252B'
const COLOR_BORDER = '#65737E'

const Container = styled.div({
  fontFamily: '"Trebuchet MS"',
  height: '100%',
  padding: 16,
  color: COLOR_FOREGROUND,
  backgroundColor: COLOR_BACKGROUND_LIGHT
})

const Header = styled.h1({
  margin: '0 0 12px'
})

const Content = styled.div({
  minHeight: 400
})

const InfoContainer = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  'div:first-of-type': {
    fontFamily: '"Trebuchet MS"',
    fontSize: 18,
    marginRight: 8
  },
  'img': {
    position: 'relative',
    bottom: -2,
    verticalAlign: 'bottom',
    marginRight: 12
  },
  'div.current-price': {
    alignSelf: 'flex-end',
  }
})

const DataTable = styled.table({
  width: '100%',
  marginBottom: 24,
  borderCollapse: 'collapse',
  'thead':  {
    fontSize: 20,
    textAlign: 'right',
    borderBottom: `3px solid ${COLOR_BORDER}`
  },
  'tbody':{
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 15,
    textAlign: 'right'
  },
  'tr': {
    borderBottom: `1px solid ${COLOR_BORDER}`
  },
  'th': {
    padding: '8px 16px'
  },
  'th.profit': {
    color: '#8FA1B3'
  },
  'th.tax': {
    color: '#B9616A'
  },
  'th.net': {
    color: '#9DBE8C'
  },
  'td': {
    verticalAlign: 'bottom',
    height: 40,
    padding: '12px 16px'
  },
  'td.currency': {
    borderRight: `1px solid ${COLOR_BORDER}`
  },
  'td.total-sell': {
    borderRight: `1px solid ${COLOR_BORDER}`
  }
})

function App() {
  const fileDragArea = React.useRef()
  const [data, setData] = React.useState()

  const { marketData } = useCryptoMarketData()

  const transactionData = React.useMemo(
    () => {
      const currencyInfo = Object.values(marketData || {}).reduce((result, entry) => {
        result[entry.symbol] = {
          symbol: entry.symbol,
          name: entry.name,
          image: entry.image,
          // currentPrice: RoundTo.currency().value(entry.current_price)
          currentPrice: entry.current_price
        }

        return result
      }, {})

      const transactions = Object.entries(data || {}).map(([currencySymbol, transaction]) => {
        const currency = currencyInfo[currencySymbol]

        const { quantity, totalBuy } = Object.values(transaction.buy || []).reduce((result, entry) => {
          result.quantity += entry.quantity
          result.totalBuy += entry.quantity * entry.spotPrice

          return result
        }, {
          quantity: 0,
          totalBuy: 0
        })

        const totalSell = quantity * currency.currentPrice
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
          // quantity: RoundTo.f8().value(quantity),
          // totalBuy: RoundTo.currency().value(totalBuy),
          // totalSell: RoundTo.currency().value(totalSell),
          // profit: RoundTo.currency().value(profit),
          // tax: RoundTo.currency().value(tax),
          // net: RoundTo.currency().value(net)
        }
      })

      return {
        currencyInfo,
        transactions
      }
    },
    [data, marketData]
  )

  console.log(transactionData)

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

  function renderSummary () {
    const { totalBuy, totalSell } = transactionData.transactions.reduce((result, transaction) => {
      // const currency = transactionData.currencyInfo[transaction.currencySymbol]
      result.totalBuy += transaction.totalBuy
      result.totalSell += transaction.totalSell

      return result
    }, {
      totalBuy: 0,
      totalSell: 0
    })

    const profit = totalSell - totalBuy
    const tax = getTax(profit)
    const net = totalSell - tax

    return (
      <div>
        <div>{totalBuy}</div>
        <div>{totalSell}</div>
        <div>{profit}</div>
        <div>{tax}</div>
        <div>{net}</div>
      </div>
    )
  }

  function rendderDataTable () {
    return (
      <DataTable>
        <thead>
          <tr>
            <th />
            <th>Quantity</th>
            <th>Total Buy</th>
            <th>Total Sell</th>
            <th className={'profit'}>Profit</th>
            <th className={'tax'}>Tax</th>
            <th className={'net'}>Net</th>
          </tr>
        </thead>
        <tbody>
          {transactionData.transactions.map((transaction) => {
            const currency = transactionData.currencyInfo[transaction.currencySymbol]

            return (
              <tr key={currency.symbol}>
                <td className={'currency'}>
                  <InfoContainer>
                    <div>
                      <img alt={currency.symbol} src={currency.image} width={24} height={24} />
                      <span>{currency.name}:</span>
                    </div>
                    <div className={'current-price'}>{RoundTo.currency().value(currency.currentPrice)}</div>
                  </InfoContainer>
                </td>
                <td>{RoundTo.f8().value(transaction.quantity)}</td>
                <td>{RoundTo.currency().value(transaction.totalBuy)}</td>
                <td className={'total-sell'}>{RoundTo.currency().value(transaction.totalSell)}</td>
                <td>{RoundTo.currency().value(transaction.profit)}</td>
                <td>{RoundTo.currency().value(transaction.tax)}</td>
                <td>{RoundTo.currency().value(transaction.net)}</td>
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
        {renderSummary()}
        {rendderDataTable()}
      </Content>
    </Container>
  )
}

export default App
