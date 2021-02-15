import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import StorageProvider from './storage'

// https://dev.to/mandiwise/electron-apps-made-easy-with-create-react-app-and-electron-forge-560e

function RootContainer () {
  return (
    <StorageProvider>
      <App />
    </StorageProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <RootContainer />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
