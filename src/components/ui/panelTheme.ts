/**
 * Shared palette for the DOM UI.
 *
 * Piltover brass against teal shadow, the same split the world is lit on. The
 * scene's own colours live in materials, so these are hand-matched to them
 * rather than derived: `brass` is the chandelier and the pilaster bands,
 * `teal` is the hourglass glass and the aura behind it.
 *
 * This file exists because the palette used to be literals repeated across
 * `CastleMap`, `HUD` and `InfoPanel`, which is exactly how the old HUD green
 * (#00ff88) survived in one file for months after being retired in another.
 */
export const panelTheme = {
  /** Panel ground. Teal-black, not neutral black — a grey panel over a warm
   *  scene reads as a browser dialog sitting on top of the game. */
  ink: 'rgba(11, 18, 22, 0.95)',
  /** Header band and skill rows: one step up from the ground. */
  inkRaised: 'rgba(24, 34, 38, 0.62)',
  /** The scrim. Dark enough to drop the hall back, sheer enough to keep it. */
  scrim: 'rgba(5, 9, 11, 0.62)',

  /** Outer frame. */
  edge: '#8a6b32',
  /** Inset hairline, a few px inside the frame. Two lines with a gap read as
   *  moulding; one line reads as a border. */
  edgeInner: '#4a3c28',

  brass: '#ffd27a',
  brassBright: '#ffe6b0',
  brassDim: '#b8965e',

  text: '#d6c9b0',
  textDim: '#8f8471',

  teal: '#3fa89e',

  shadow: '0 18px 60px rgba(0, 0, 0, 0.65)',
  /** Warm bleed around the frame, as if the panel were lit by the hall. */
  glow: '0 0 40px rgba(255, 210, 122, 0.10)',
} as const

/**
 * Level ramp, darkest to brightest. Warm throughout: a categorical scale in
 * mixed hues (the old blue/green/yellow badges) reads as unrelated tags, and
 * these four values are a single ordered axis.
 */
export const levelRamp: Record<string, string> = {
  beginner: '#6b5a3e',
  intermediate: '#b8965e',
  advanced: '#ffd27a',
  expert: '#ffe6b0',
}

/** Ordered, for anything that needs to treat level as a scale rather than a key. */
export const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'] as const

export type Level = (typeof LEVEL_ORDER)[number]
