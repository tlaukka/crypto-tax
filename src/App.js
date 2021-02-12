import React from 'react'
import styled from '@emotion/styled'
import fs from 'fs'
import useCryptoMarketData from './useCryptoMarketData'
import RoundTo from './RoundTo'
import parseTransactionData from './parseTransactionData'
import useTransactionData from './useTransactionData'
import useSummaryData from './useSummaryData'

const COLOR_FOREGROUND = '#DFE1E8'
const COLOR_BACKGROUND_LIGHT = '#2B303B'
// const COLOR_BACKGROUND_DARK = '#21252B'
const COLOR_BORDER = '#65737E'

const Container = styled.div({
  fontFamily: '"Trebuchet MS"',
  height: '100vh',
  color: COLOR_FOREGROUND,
  backgroundColor: COLOR_BACKGROUND_LIGHT
})

const Header = styled.h1({
  margin: '0 0 24px'
})

const Content = styled.div({
  minHeight: 400,
  padding: '16px 16px 48px'
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

const SummaryTable = styled.table({
  borderCollapse: 'collapse',
  fontSize: 16,
  marginBottom: 24,
  'tr.profit': {
    borderTop: `1px solid ${COLOR_BORDER}`,
    color: '#8FA1B3'
  },
  'tr > td:first-of-type': {
    fontFamily: '"Trebuchet MS"',
    textAlign: 'left',
    padding: '2px 12px 2px 2px'
  },
  'tr.total-sell td': {
    paddingBottom: 4
  },
  'tr.profit td': {
    paddingTop: 12
  },
  'tr.tax': {
    color: '#B9616A'
  },
  'tr.net': {
    color: '#9DBE8C'
  },
  'td': {
    fontFamily: '"Lucida Console", Monaco, monospace',
    textAlign: 'right',
    padding: '2px 2px 2px 2px'
  }
})

const TransactionTable = styled.table({
  borderCollapse: 'collapse',
  width: '100%',
  marginBottom: 24,
  'thead': {
    fontSize: 20,
    textAlign: 'right',
    borderBottom: `3px solid ${COLOR_BORDER}`
  },
  'tbody': {
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
  const transactionData = useTransactionData(marketData, data)
  const summaryData = useSummaryData(transactionData)

  React.useEffect(
    () => {
      async function getTransactionData() {
        const path = localStorage.getItem('path')

        if (path) {
          const file = fs.createReadStream(path)
          const data = await parseTransactionData(file)

          setData(data)
        }
      }

      getTransactionData()
    },
    []
  )

  React.useEffect(
    () => {
      fileDragArea.current.ondragover = () => false
      fileDragArea.current.ondragleave = () => false
      fileDragArea.current.ondragend = () => false

      fileDragArea.current.ondrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]

        if (!file) {
          return false
        }

        async function getTransactionData() {
          const data = await parseTransactionData(file)
          setData(data)
        }

        getTransactionData()
        return false
      }
    },
    []
  )

  function renderSummary() {
    if (!summaryData) {
      return null
    }

    return (
      <SummaryTable>
        <tbody>
          <tr>
            <td>Total Buy:</td>
            <td>{RoundTo.currency().value(summaryData.totalBuy)}</td>
          </tr>
          <tr className={'total-sell'}>
            <td>Total Sell:</td>
            <td>{RoundTo.currency().value(summaryData.totalSell)}</td>
          </tr>
          <tr className={'profit'}>
            <td>Profit:</td>
            <td>{RoundTo.currency().value(summaryData.profit)}</td>
          </tr>
          <tr className={'tax'}>
            <td>Tax:</td>
            <td>{RoundTo.currency().value(summaryData.tax)}</td>
          </tr>
          <tr className={'net'}>
            <td>Net:</td>
            <td>{RoundTo.currency().value(summaryData.net)}</td>
          </tr>
        </tbody>
      </SummaryTable>
    )
  }

  function rendderTransactionTable() {
    return (
      <TransactionTable>
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
          {transactionData.map((transaction) => {
            const currency = marketData[transaction.currencySymbol]

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
      </TransactionTable>
    )
  }

  return (
    <Container>
      <Content ref={fileDragArea}>
        <Header>Crypto Tax</Header>
        {renderSummary()}
        {rendderTransactionTable()}
      </Content>
    </Container>
  )
}

export default App
