import Papa from 'papaparse'
import getTransactionData from './getTransactionData'

export default function parseTransactionData (file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ',',
      dynamicTyping: true,
      complete: (results) => {
        if (!results?.data) {
          return reject('No data available!')
        }

        return resolve(getTransactionData(results))
      }
    })
  })
}
