import { Bimap } from '../src'

const testSides = (
  bm: Bimap,
  expected: any,
  side: 'left' | 'right' = 'left'
) => {
  expect(side === 'left' ? bm.left : bm.right).toEqual(expected)
  expect(side === 'left' ? bm.right : bm.left).toEqual(Bimap.invert(expected))
}

const bm = new Bimap()

test('empty bimap', () => {
  testSides(bm, {})
})

test('add to left', () => {
  bm.left.l1 = 'r1'
  testSides(bm, { l1: 'r1' })
})

test('rename key', () => {
  bm.left.l1 = 'r1New'
  testSides(bm, { l1: 'r1New' })
  bm.right.r1New = 'l1New'
  testSides(bm, { r1New: 'l1New' }, 'right')
})

test('delete key', () => {
  const bm = new Bimap()
  bm.left.foo = 'bar'
  delete bm.left.foo
  testSides(bm, {})

  bm.right.foo = 'bar'
  delete bm.right.foo
  testSides(bm, {})
})

test('indirect overwrite', () => {
  let bm = new Bimap()
  bm.left.a = 'right'
  bm.left.b = 'right'

  testSides(bm, { b: 'right' })

  bm = new Bimap()
  bm.right.a = 'left'
  bm.right.b = 'left'

  testSides(bm, { b: 'left' }, 'right')
})

test('Bimap.invert', () => {
  expect(Bimap.invert({ a: 'b', foo: 'bar' })).toEqual({ b: 'a', bar: 'foo' })
  expect(() => Bimap.invert({ a: 'foo', b: 'foo' })).toThrow()
})

test('Bimap.from', () => {
  const obj = { l1: 'r1', l2: 'r2' }
  const bm = Bimap.from(obj)
  testSides(bm, obj)
  expect(() => Bimap.from({ a: 'foo', b: 'foo' })).toThrow()
  expect(() => Bimap.from({ a: {} } as any)).toThrow()
})

test('assign left', () => {
  const bm = Bimap.from({ tmp: 'tmp' })
  const obj = { a: 'b', c: 'd' }
  bm.left = obj
  testSides(bm, obj)
})

test('assign right', () => {
  const bm = Bimap.from({ tmp: 'tmp' })
  const obj = { a: 'b', c: 'd' }
  bm.right = obj
  testSides(bm, obj, 'right')
})

test('left & right aliases', () => {
  expect(bm.l).toBe(bm.left)
  expect(bm.r).toBe(bm.right)
})

test('iterate', () => {
  const obj = { a: '1', b: '2', c: '3', d: '4' }
  const bimap = Bimap.from(obj)
  expect([...bimap]).toEqual(expect.arrayContaining(Object.entries(obj)))
})
