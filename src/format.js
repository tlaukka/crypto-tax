const CurrencyFormat = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' })

class Currency {
  constructor (value) {
    this._value = CurrencyFormat.format(value).slice(0, -2)
  }

  symbol () {
    this._value += ' €'
    return this
  }

  get value () {
    return this._value
  }
}

function currency (value) {
  return new Currency(value)
}

const format = {
  currency
}

export default format
