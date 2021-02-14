import fs from 'fs'

const STORAGE_FILE = 'storage.json'

let storage = {}

function load () {
  return new Promise((resolve, reject) => {
    fs.readFile(STORAGE_FILE, 'utf8', (error, data) => {
      console.log(data)
      if (error) {
        console.log(`Error loading file: ${STORAGE_FILE}`)
        return reject(`Error loading file: ${STORAGE_FILE}`)
      }

      storage = JSON.parse(data)
      return resolve()
    })
  })
}

function save (key, value) {
  storage[key] = value

  return new Promise((resolve, reject) => {
    fs.writeFile(STORAGE_FILE, JSON.stringify(storage), 'utf8', (error) => {
      if (error) {
        console.log(`Error writing file: ${STORAGE_FILE}`)
        return reject(`Error writing file: ${STORAGE_FILE}`)
      }

      return resolve()
    })
  })
}

function get (key) {
  return storage[key]
}

export default {
  load,
  save,
  get
}
