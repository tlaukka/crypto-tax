import React from 'react'
import fs from 'fs'

const STORAGE_FILE = 'storage.json'

type StorageRecord = Record<string, string>

function readFile (path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, data) => {
      if (error) {
        return reject(error)
      }

      resolve(data)
    })
  })
}

function writeFile (path: string, data: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', (error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })
  })
}

async function load (): Promise<StorageRecord> {
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

async function save (data: StorageRecord) {
  try {
    writeFile(STORAGE_FILE, JSON.stringify(data))
  } catch (error) {
    console.log(error)
  }
}

interface StorageContextType {
  getValue: (key: string) => string | undefined,
  setValue: (key: string, value: string) => void
}

export const StorageContext = React.createContext<StorageContextType>(null)

export function useStorage () {
  return React.useContext(StorageContext)
}

export default function StorageProvider ({ children }) {
  const [storageReady, setStorageReady] = React.useState(false)
  const [storage, setStorage] = React.useState<StorageRecord>()

  function getValue (key: string): string | undefined {
    return storage?.[key]
  }

  function setValue (key: string, value: string) {
    setStorage((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  React.useEffect(
    () => {
      if (storage) {
        save(storage)
      }
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
