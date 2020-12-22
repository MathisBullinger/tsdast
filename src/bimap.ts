import { TypeViolationError, UniqueViolationError } from './error'
type BiMap = Record<string, string>

type Primitive = string | number | symbol

type FilterKeys<T extends Record<string, any>, C> = keyof Pick<
  T,
  {
    [K in keyof T]: T[K] extends C ? K : never
  }[keyof T]
>

type Inverted<T extends Record<Primitive, Primitive>> = {
  [K in T[keyof T]]: FilterKeys<T, K>
}

export default class Bimap {
  private _leftObj: BiMap = {}
  private _rightObj: BiMap = {}

  private handler: ProxyHandler<BiMap> = {
    set: (here, key: string, value: string, ...rest) => {
      const there = this[here === this._leftObj ? '_rightObj' : '_leftObj']
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
      if (value)
        delete this[target === this._leftObj ? '_rightObj' : '_leftObj'][value]
      return true
    },
  }

  private _left = new Proxy(this._leftObj, this.handler)
  private _right = new Proxy(this._rightObj, this.handler)

  public get left() {
    return this._left
  }
  public get right() {
    return this._right
  }

  public set left(obj: BiMap) {
    Bimap.validate(obj, true)
    this._leftObj = obj
    this._rightObj = Bimap.invert(obj)
    this.proxy()
  }

  public set right(obj: BiMap) {
    Bimap.validate(obj, true)
    this._rightObj = obj
    this._leftObj = Bimap.invert(obj)
    this.proxy()
  }

  public get l() {
    return this._left
  }
  public get r() {
    return this._right
  }

  static from(target: BiMap): Bimap {
    Bimap.validate(target, true)

    const map = new Bimap()
    for (const [left, right] of Object.entries(target)) map._left[left] = right
    return map
  }

  public static invert<T extends BiMap>(obj: T): Inverted<T> {
    Bimap.validate(obj, true)
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [v, k])
    ) as any
  }

  private static validate<T extends boolean>(
    obj: BiMap,
    throwErr?: T
  ): boolean {
    const sides = [Object.keys(obj), Object.values(obj)]

    sides.flat().forEach((v) => {
      if (!['string', 'number', 'symbol'].includes(typeof v)) {
        if (throwErr)
          throw new TypeViolationError(
            'Bimap values must be of type string, number, or symbol'
          )
        return false
      }
    })

    sides[1].forEach((v, i, side) => {
      if (side.indexOf(v) === i) return
      if (throwErr)
        throw new UniqueViolationError(
          `[UniqueViolationError]: duplicate right key ${JSON.stringify(v)}`
        )
      return false
    })

    return true
  }

  private proxy() {
    this._left = new Proxy(this._leftObj, this.handler)
    this._right = new Proxy(this._rightObj, this.handler)
  }
}
