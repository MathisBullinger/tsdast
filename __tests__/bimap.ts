import { Bimap } from '../src'
import { UniqueViolationError } from '../src/error'

const bm = new Bimap()

test('empty bimap', () => {
  expect(bm.left).toEqual({})
  expect(bm.right).toEqual({})
})

test('add to left', () => {
  bm.left.l1 = 'r1'
  expect(bm.left).toEqual({ l1: 'r1' })
  expect(bm.right).toEqual({ r1: 'l1' })
})

test('rename key', () => {
  bm.left.l1 = 'r1New'
  expect(bm.left).toEqual({ l1: 'r1New' })
  expect(bm.right).toEqual({ r1New: 'l1' })
  bm.right.r1New = 'l1New'
  expect(bm.right).toEqual({ r1New: 'l1New' })
  expect(bm.left).toEqual({ l1New: 'r1New' })
})

test('delete key', () => {
  const bm = new Bimap()
  bm.left.foo = 'bar'
  delete bm.left.foo
  expect(bm.left).toEqual({})
  expect(bm.right).toEqual({})

  bm.right.foo = 'bar'
  delete bm.right.foo
  expect(bm.left).toEqual({})
  expect(bm.right).toEqual({})
})

test('indirect overwrite', () => {
  let bm = new Bimap()
  bm.left.a = 'right'
  bm.left.b = 'right'

  expect(bm.left).toEqual({ b: 'right' })
  expect(bm.right).toEqual({ right: 'b' })

  bm = new Bimap()
  bm.right.a = 'left'
  bm.right.b = 'left'

  expect(bm.right).toEqual({ b: 'left' })
  expect(bm.left).toEqual({ left: 'b' })
})

test('Bimap.invert', () => {
  expect(Bimap.invert({ a: 'b', foo: 'bar' })).toEqual({ b: 'a', bar: 'foo' })
  expect(() => Bimap.invert({ a: 'foo', b: 'foo' })).toThrow()
})

test('Bimap.from', () => {
  const obj = { l1: 'r1', l2: 'r2' }
  const { left, right } = Bimap.from(obj)
  expect(left).toEqual(obj)
  expect(right).toEqual(Bimap.invert(obj))
  expect(() => Bimap.from({ a: 'foo', b: 'foo' })).toThrow()
  expect(() => Bimap.from({ a: {} } as any)).toThrow()
})

test('assign left', () => {
  const bm = Bimap.from({ tmp: 'tmp' })
  const obj = { a: 'b', c: 'd' }
  bm.left = obj
  expect(bm.left).toEqual(obj)
  expect(bm.right).toEqual(Bimap.invert(obj))
})

test('assign right', () => {
  const bm = Bimap.from({ tmp: 'tmp' })
  const obj = { a: 'b', c: 'd' }
  bm.right = obj
  expect(bm.right).toEqual(obj)
  expect(bm.left).toEqual(Bimap.invert(obj))
})

test('left & right aliases', () => {
  expect(bm.l).toBe(bm.left)
  expect(bm.r).toBe(bm.right)
})

// number, symbol
