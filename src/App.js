import React from 'react'
import styled from '@emotion/styled'
import fs from 'fs'
import useCurrencyData from './useCurrencyData'
import useMarketData from './useMarketData'
import useTransactionData from './useTransactionData'
import parseTransactionData from './parser/parseTransactionData'
import useSummaryData from './useSummaryData'
import Colors from './Colors'
import { useStorage } from './storage'
import format from './format'
import Loader from './Loader'

const Container = styled.div({
  height: '100%',
  color: Colors.foreground,
  backgroundColor: Colors.backgroundLight
})

const TopBar = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
  paddingBottom: 8,
  borderBottom: `3px solid ${Colors.border}`
})

const Header = styled.h1({
  margin: 0
})

const Content = styled.div({
  minHeight: 400,
  padding: '16px 16px 32px'
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
    color: '#EBCB8B'
  }
})

const SummaryTable = styled.table({
  borderCollapse: 'collapse',
  fontSize: 16,
  marginBottom: 24,
  'tr > td:first-of-type': {
    fontFamily: '"Trebuchet MS"',
    textAlign: 'left',
    padding: '2px 12px 2px 2px'
  },
  'tr.total-sell td': {
    paddingBottom: 4
  },
  'tr.profit': {
    borderTop: `1px solid ${Colors.border}`,
    color: '#8FA1B3'
  },
  'tr.profit td': {
    paddingTop: 12
  },
  'tr.tax': {
    color: '#B9616A'
  },
  'tr.net': {
    fontSize: 22,
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
    borderBottom: `3px solid ${Colors.border}`
  },
  'tbody': {
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 15,
    textAlign: 'right'
  },
  'tr': {
    borderBottom: `1px solid ${Colors.border}`
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
    borderRight: `1px solid ${Colors.border}`
  },
  'td.total-sell': {
    borderRight: `1px solid ${Colors.border}`
  }
})

const TransactionEmpty = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 200,
  borderRadius: 4,
  border: `1px dashed ${Colors.border}`,
  color: Colors.border
})

function App() {
  const storage = useStorage()

  const fileDragArea = React.useRef()
  const [data, setData] = React.useState()

  const { data: currencyData, fetching: fetchingCurrencyData } = useCurrencyData()
  const { data: marketData, fetching: fetchingMarketData } = useMarketData(currencyData, data)
  const transactionData = useTransactionData(marketData, data)
  const summaryData = useSummaryData(transactionData)

  // React.useEffect(
  //   () => {
  //     async function getTransactionData() {
  //       try {
  //         const path = storage.getValue('transactionFilePath')

  //         if (path) {
  //           const file = fs.createReadStream(path)
  //           const data = await parseTransactionData(file)

  //           file.close()
  //           setData(data)
  //         }
  //       } catch (error) {
  //         alert(error)
  //       }
  //     }

  //     getTransactionData()
  //   },
  //   [storage]
  // )

  React.useEffect(
    () => {
      fileDragArea.current.ondragover = () => false
      fileDragArea.current.ondragleave = () => false
      fileDragArea.current.ondragend = () => false

      fileDragArea.current.ondrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]

        async function getTransactionData() {
          try {
            const data = await parseTransactionData(e.dataTransfer.files)
            setData(data)

            storage.setValue('transactionFilePath', file.path)
          } catch (error) {
            console.error(error)
            // alert(error)
          }
        }

        getTransactionData()
        return false
      }
    },
    [storage]
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
            <td>{format.currency(summaryData.totalBuy).symbol().value}</td>
          </tr>
          <tr className={'total-sell'}>
            <td>Total Sell:</td>
            <td>{format.currency(summaryData.totalSell).symbol().value}</td>
          </tr>
          <tr className={'profit'}>
            <td>Profit:</td>
            <td>{format.currency(summaryData.profit).symbol().value}</td>
          </tr>
          <tr className={'tax'}>
            <td>Tax:</td>
            <td>{format.currency(summaryData.tax).symbol().value}</td>
          </tr>
          <tr className={'net'}>
            <td>Net:</td>
            <td>{format.currency(summaryData.net).symbol().value}</td>
          </tr>
        </tbody>
      </SummaryTable>
    )
  }

  function renderMarketData(transaction) {
    const currency = marketData?.[transaction.currencySymbol]

    if (!currency) {
      return (
        <InfoContainer>
          <span>No market data!</span>
        </InfoContainer>
      )
    }

    return (
      <InfoContainer>
        <div>
          <img alt={currency.symbol} src={currency.image} width={24} height={24} />
          <span>{currency.name}:</span>
        </div>
        <div className={'current-price'}>{format.currency(currency.currentPrice).value}</div>
      </InfoContainer>
    )
  }

  function renderTransactionTable() {
    if (transactionData.length === 0) {
      return (
        <TransactionEmpty>
          {(fetchingCurrencyData || fetchingMarketData) ? (
            <Loader.Large type={'ThreeDots'} />
          ) : (
            <h3>No data available!</h3>
          )}
        </TransactionEmpty>
      )
    }

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
            return (
              <tr key={transaction.currencySymbol}>
                <td className={'currency'}>
                  {renderMarketData(transaction)}
                </td>
                <td>{transaction.quantity.toFixed(8)}</td>
                <td>{format.currency(transaction.totalBuy).value}</td>
                <td className={'total-sell'}>{format.currency(transaction.totalSell).value}</td>
                <td>{format.currency(transaction.profit).value}</td>
                <td>{format.currency(transaction.tax).value}</td>
                <td>{format.currency(transaction.net).value}</td>
              </tr>
            )
          })}
        </tbody>
      </TransactionTable>
    )
  }

  return (
    <Container ref={fileDragArea}>
      <Content>
        <TopBar>
          <Header>Crypto Tax</Header>
          {(fetchingCurrencyData || fetchingMarketData) && <Loader.Small />}
        </TopBar>
        {renderSummary()}
        {renderTransactionTable()}
      </Content>
    </Container>
  )
}

export default App
