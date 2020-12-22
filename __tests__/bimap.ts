import { Bimap } from '../src'

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

test('left & right aliases', () => {
  expect(bm.l).toBe(bm.left)
  expect(bm.r).toBe(bm.right)
})

// number, symbol
