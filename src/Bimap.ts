import { TypeViolationError, UniqueViolationError } from './error'
type BiMap = Record<string, string>

export default class Bimap {
  private readonly _left: BiMap = {}
  private readonly _right: BiMap = {}

  private handler: ProxyHandler<BiMap> = {
    set: (here, key: string, value: string) => {
      const there = this[here === this._left ? '_right' : '_left']
      const oldKey = there[value]

      delete there[here[key]]
      here[key] = value
      there[value] = key
      delete here[oldKey]

      return true
    },

    deleteProperty: (target, key: string) => {
      const value = target[key]
      delete target[key]
      if (value) delete this[target === this._left ? '_right' : '_left'][value]
      return true
    },
  }

  public readonly left = new Proxy(this._left, this.handler)
  public readonly right = new Proxy(this._right, this.handler)

  public get l() {
    return this.left
  }
  public get r() {
    return this.right
  }

  static from(target: BiMap): Bimap {
    const sides = [Object.keys(target), Object.values(target)]

    sides.flat().forEach((v) => {
      if (!['string', 'number', 'symbol'].includes(typeof v))
        throw new TypeViolationError(
          'Bimap values must be of type string, number, or symbol'
        )
    })

    sides[1].forEach((v, i, side) => {
      if (side.indexOf(v) === i) return
      throw new UniqueViolationError(
        `[UniqueViolationError]: duplicate right key ${JSON.stringify(v)}`
      )
    })

    const map = new Bimap()

    return map
  }
}
