/**
 * The pointer state for clickable objects in the scene.
 *
 * This exists because the rule it encodes is a global one — there is a single
 * `document.body` — and it used to be written out by hand in every component
 * with a hover handler. Three of them drifted: two restored `none` on leave
 * and one restored `auto`, and the two that restored `none` left the page with
 * no cursor at all.
 *
 * The rule: **`none` is only legal while something else is drawing a
 * replacement.** `Cursor.tsx` used to be that something — it hid the native
 * cursor on mount and drew a ring following the mouse — but it re-rendered on
 * every `mousemove` and visibly lagged the pointer, so it is no longer
 * mounted. With no replacement being drawn, the native cursor has to come
 * back when a hover ends.
 *
 * If a custom cursor is ever reinstated (with a ref and a direct DOM write
 * rather than React state), `HOVER_OUT` is the one line that changes.
 */

const HOVER_IN = 'pointer'

/** What the scene restores to. `auto`, not `none` — see above. */
const HOVER_OUT = 'auto'

export function beginHover(): void {
  document.body.style.cursor = HOVER_IN
}

export function endHover(): void {
  document.body.style.cursor = HOVER_OUT
}
