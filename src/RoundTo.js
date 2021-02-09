const MAX_PRECISION = 11
const DEFAULT_PRECISION = 100

function createPrecisionSetters (instance) {
  [...Array(MAX_PRECISION).keys()].forEach((entry) => {
    instance[`f${entry}`] = function () {
      instance.precision = Math.pow(10, entry)
      return instance
    }
  })

  instance.integer = function () {
    instance.precision = 1
    return instance
  }

  instance.currency = function () {
    instance.precision = 100
    return instance
  }
}

const RoundTo = {
  result: 0,
  precision: DEFAULT_PRECISION,
  value: function (value) {
    return (Math.round((value + Number.EPSILON) * this.precision) / this.precision).toFixed(String(this.precision).length - 1)
  }
}

createPrecisionSetters(RoundTo)

export default RoundTo
