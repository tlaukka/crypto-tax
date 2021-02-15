import React from 'react'
import fs from 'fs'

const STORAGE_FILE = 'storage.json'

function readFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, data) => {
      if (error) {
        return reject(error)
      }

      resolve(data)
    })
  })
}

function writeFile (path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', (error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })
  })
}

async function load () {
  try {
    const data = await readFile(STORAGE_FILE)
    return JSON.parse(data)
  } catch (error) {
    console.log(error)
    if (error.code === 'ENOENT') {
      // Create an empty storage file if it doesn't exist
      await writeFile(STORAGE_FILE, JSON.stringify({}))
      const data = await load()
      return data
    }
  }
}

async function save (data) {
  try {
    console.log('-------- saving -------->')
    console.log(data)
    await writeFile(STORAGE_FILE, JSON.stringify(data))
  } catch (error) {
    console.log(error)
  }
}

export const StorageContext = React.createContext()

export function useStorage () {
  return React.useContext(StorageContext)
}

export default function StorageProvider ({ children }) {
  const [storageReady, setStorageReady] = React.useState(false)
  const [storage, setStorage] = React.useState()

  function getValue (key) {
    return storage?.[key]
  }

  function setValue (key, value) {
    setStorage((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  React.useEffect(
    () => {
      async function saveStorage () {
        if (storage) {
          save(storage)
        }
      }

      saveStorage()
    },
    [storage]
  )

  React.useEffect(
    () => {
      async function loadStorage () {
        const data = await load()

        setStorageReady(true)
        setStorage(data)
      }

      loadStorage()
    },
    []
  )

  if (!storageReady) {
    return null
  }

  return (
    <StorageContext.Provider value={{ getValue, setValue }}>
      {children}
    </StorageContext.Provider>
  )
}
