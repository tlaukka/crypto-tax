export const TAX_RATE_HIGH = 0.34
export const TAX_RATE_LOW = 0.3
export const TAX_RATE_HIGH_LIMIT = 30000
export const WITH_COINBASE_FEE = 0.9851

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

export function withCoinbaseFee (value) {
  return value * WITH_COINBASE_FEE
}

function getTaxInfo (data, buyRowTracker, sellRowTracker) {
  const buyPrice = buyRowTracker.quantity * data.buy[buyRowTracker.index].spotPrice
  const sellPrice = sellRowTracker.quantity * data.sell[sellRowTracker.index].spotPrice

  return {
    timestamp: data.sell[sellRowTracker.index].timestamp,
    tax: Math.max(0, (sellPrice - buyPrice) * TAX_RATE_LOW)
  }
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
      quantity: data.buy[0].quantity
    }

    const sellRowTracker = {
      index: 0,
      quantity: data.sell[0].quantity
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
        // const buyPrice = buyRowTracker.quantity * data.buy[buyRowTracker.index].spotPrice
        // const sellPrice = sellRowTracker.quantity * data.sell[sellRowTracker.index].spotPrice

        // tax.push({
        //   timestamp: data.sell[sellRowTracker.index].timestamp,
        //   tax: Math.max(0, (sellPrice - buyPrice) * TAX_RATE_LOW)
        // })
        tax.push(getTaxInfo(data, buyRowTracker, sellRowTracker))

        buyRowTracker.quantity = 0
        sellRowTracker.quantity = 0

        continue
      }

      if (buyRowTracker.quantity > sellRowTracker.quantity) {
        tax.push(getTaxInfo(data, buyRowTracker, sellRowTracker))

        buyRowTracker.quantity =- sellRowTracker.quantity
        sellRowTracker.quantity = 0

        continue
      }

      if (buyRowTracker.quantity < sellRowTracker.quantity) {
        tax.push(getTaxInfo(data, buyRowTracker, sellRowTracker))

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
