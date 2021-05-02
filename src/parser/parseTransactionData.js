import fs from 'fs'
import Papa from 'papaparse'
import { default as coinbase } from './coinbase'
import { default as cex } from './cex'
import { default as binance } from './binance'

function isCsv (path) {
  return /.csv$/i.test(path)
}

function getDataTransformer (results) {
  for (let i = 0; i < results.data.length; i++) {
    const identifier = results.data[i][0]

    switch (identifier) {
      case 'DateUTC': return cex
      case 'Date(UTC)': return binance
      case 'Timestamp': return coinbase
      default: continue
    }
  }

  return () => { return {} }
}

function parse (file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ',',
      dynamicTyping: true,
      complete: (results) => {
        if (!results?.data) {
          return reject(`No data available in file: ${file}`)
        }

        const transformer = getDataTransformer(results)
        return resolve(transformer(results))
      },
      error: (error) => {
        return reject(error)
      }
    })
  })
}

function readDirectory (directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory.path, (error, files) => {
      if (error) {
        return reject(`Failed to read directory: ${directory.path}`)
      }

      const csvFiles = files
        .filter((file) => isCsv(file))
        .map((file) => `${directory.path}/${file}`)

      return resolve(csvFiles)
    })
  })
}

export default async function parseTransactionData (files) {
  if ((files.length === 1) && !isCsv(files[0].path)) {
    try {
      const csvFiles = await readDirectory(files[0])
      const transactionData = []

      for (const path of csvFiles) {
        const file = fs.createReadStream(path)
        const data = await parse(file)
        file.close()

        transactionData.push(data)
      }

      const mergedData = transactionData.reduce((result, entry) => {
        for (const symbol in entry) {
          if (!result[symbol]) {
            result[symbol] = {}
          }

          for (const transactionType in entry[symbol]) {
            if (!result[symbol][transactionType]) {
              result[symbol][transactionType] = []
            }

            result[symbol][transactionType] = result[symbol][transactionType].concat(entry[symbol][transactionType])
          }
        }

        return result
      }, {})

      return mergedData
    } catch (error) {
      throw error
    }
  }

  if ((files.length === 1) && isCsv(files[0].path)) {
    return parse(files[0])
  }

  return {}
}
