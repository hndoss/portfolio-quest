import { afterEach, describe, expect, it } from 'vitest'
import { beginHover, endHover } from '../components/canvas/hoverCursor'

afterEach(() => {
  document.body.style.cursor = ''
})

describe('hoverCursor', () => {
  it('shows a pointer while hovering something clickable', () => {
    beginHover()
    expect(document.body.style.cursor).toBe('pointer')
  })

  /**
   * The regression this exists for: leaving a hotspot used to restore `none`,
   * on the assumption that `Cursor.tsx` was drawing a replacement ring. It is
   * no longer mounted, so `none` left the page with no cursor at all.
   */
  it('leaves a visible cursor behind after the hover ends', () => {
    beginHover()
    endHover()
    expect(document.body.style.cursor).not.toBe('none')
    expect(document.body.style.cursor).toBe('auto')
  })
})
