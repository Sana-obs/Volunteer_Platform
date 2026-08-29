import { describe, it, expect } from 'vitest'
import { getColumnsForWidth, shouldVirtualize } from './useVirtualizedGrid'

describe('shouldVirtualize', () => {
  it('is false when item count is below the threshold', () => {
    expect(shouldVirtualize(10, 40)).toBe(false)
  })

  it('is false when item count exactly equals the threshold', () => {
    expect(shouldVirtualize(40, 40)).toBe(false)
  })

  it('is true once item count exceeds the threshold', () => {
    expect(shouldVirtualize(41, 40)).toBe(true)
  })

  it('uses the default threshold of 40 when none is given', () => {
    expect(shouldVirtualize(40)).toBe(false)
    expect(shouldVirtualize(41)).toBe(true)
  })
})

describe('getColumnsForWidth', () => {
  it('returns 1 column on mobile widths (below sm)', () => {
    expect(getColumnsForWidth(375)).toBe(1)
    expect(getColumnsForWidth(639)).toBe(1)
  })

  it('returns 2 columns from the sm breakpoint (640px) up to xl', () => {
    expect(getColumnsForWidth(640)).toBe(2)
    expect(getColumnsForWidth(1024)).toBe(2)
    expect(getColumnsForWidth(1279)).toBe(2)
  })

  it('returns 3 columns from the xl breakpoint (1280px) and up', () => {
    expect(getColumnsForWidth(1280)).toBe(3)
    expect(getColumnsForWidth(1920)).toBe(3)
  })

  it('supports custom breakpoints instead of the tailwind defaults', () => {
    const breakpoints = [
      { minWidth: 900, columns: 4 },
      { minWidth: 0, columns: 1 },
    ]
    expect(getColumnsForWidth(500, breakpoints)).toBe(1)
    expect(getColumnsForWidth(900, breakpoints)).toBe(4)
  })
})
