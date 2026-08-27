import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROPS, PROP_SLUGS, propUrl, type PropSlug } from '../generated/props'

/**
 * `src/generated/props.ts` is written by `npm run models`, which needs Blender
 * and so cannot run unattended. Nothing otherwise stops the manifest drifting
 * from what is actually on disk — and a stale manifest silently restores the
 * exact runtime 404 the slug type exists to prevent.
 *
 * These are that guard. Same shape of problem as viewpoints.json, which has no
 * equivalent.
 */
// import.meta.dirname, not __dirname: this project is type: module, and
// __dirname only resolves here because vite-node injects it. Not
// new URL(..., import.meta.url) either — Vite rewrites import.meta.url, so a
// relative URL resolves against the dev-server origin, not the filesystem.
const PUBLIC = join(import.meta.dirname, '../../public')

describe('prop manifest', () => {
  it('lists at least one prop', () => {
    expect(PROP_SLUGS.length).toBeGreaterThan(0)
  })

  it.each(PROP_SLUGS)('%s has a .glb on disk matching its recorded size', (slug) => {
    const path = join(PUBLIC, propUrl(slug).replace(/^\//, ''))
    expect(existsSync(path), `${path} is missing — regenerate with \`npm run models\``).toBe(true)
    expect(statSync(path).size).toBe(PROPS[slug].bytes)
  })

  it('has no .glb without a manifest entry', () => {
    const dir = join(PUBLIC, 'models/props')
    const onDisk = readdirSync(dir).filter((f) => f.endsWith('.glb'))
    const known = new Set(PROP_SLUGS.map((s) => `${s}.glb`))
    expect(onDisk.filter((f) => !known.has(f))).toEqual([])
  })

  it('keys the map by each entry’s own slug', () => {
    for (const slug of PROP_SLUGS) expect(PROPS[slug].slug).toBe(slug)
  })

  it('rejects an unknown slug at the type level', () => {
    // @ts-expect-error 'nope' is not a PropSlug
    const bad: PropSlug = 'nope'
    expect(bad).toBe('nope')
  })
})
