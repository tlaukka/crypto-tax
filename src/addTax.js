export const TAX_RATE_HIGH = 0.34
export const TAX_RATE_LOW = 0.3
export const TAX_RATE_HIGH_LIMIT = 30000

export function getTax (profit) {
  let tax = 0

  if (profit > 0) {
    if (profit > TAX_RATE_HIGH_LIMIT) {
      tax += TAX_RATE_HIGH_LIMIT * TAX_RATE_LOW
      tax += (profit - TAX_RATE_HIGH_LIMIT) * TAX_RATE_HIGH
    } else {
      tax += profit * TAX_RATE_LOW
    }
  }

  return tax
}

export default function addTax (data) {
  return Object.entries(data).reduce((result, entry) => {
    const [symbol, data] = entry

    if (!data.buy || !data.sell) {
      return result
    }

    const tax = []

    const buyRowTracker = {
      index: 0,
      excess: 0,
      total: 0,
      quantity: 0
    }

    const sellRowTracker = {
      index: 0,
      excess: 0,
      total: 0,
      quantity: 0
    }

    while (true) {
      if (buyRowTracker.quantity === 0) {
        buyRowTracker.index++

        if (!data.buy[buyRowTracker.index]) {
          break
        }

        buyRowTracker.quantity = data.buy[buyRowTracker.index].quantity
      }

      if (sellRowTracker.quantity === 0) {
        sellRowTracker.index++

        if (!data.sell[sellRowTracker.index]) {
          break
        }

        sellRowTracker.quantity = data.sell[sellRowTracker.index].quantity
      }

      if (buyRowTracker.quantity === sellRowTracker.quantity) {
        // const buyPrice = data.buy[buyRowTracker.index]
        // const sellPrice = 0

        // tax.push({
        //   timestamp: data.sell[sellRowTracker.index].timestamp,
        //   tax: data.buy[buyRowTracker.index]
        // })

        buyRowTracker.quantity = 0
        sellRowTracker.quantity = 0

        continue
      }

      if (buyRowTracker.quantity > sellRowTracker.quantity) {
        tax.push({})

        buyRowTracker.quantity =- sellRowTracker.quantity
        sellRowTracker.quantity = 0

        continue
      }

      if (buyRowTracker.quantity < sellRowTracker.quantity) {
        tax.push({})

        sellRowTracker.quantity =- buyRowTracker.quantity
        buyRowTracker.quantity = 0

        continue
      }
    }

    result[symbol] = {
      ...data,
      tax
    }

    return result
  }, {})
}
