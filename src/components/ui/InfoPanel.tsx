import { useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useCVData } from '../../hooks/useCVData'
import type {
  SkillItem,
  Area,
  Profile,
  BeaconExperience,
  IncidentRecord,
} from '../../types/cv'
import { panelTheme as t, levelRamp, type Level } from './panelTheme'
import { HOURGLASS_CONTENT_ID } from '../canvas/hallLayout'

/**
 * The content panel, opened by clicking the hourglass (and by any info point).
 *
 * A centred modal over a dimmed hall rather than the drawer this used to be.
 * A panel pinned to the right edge is a web pattern — it reads as chrome
 * bolted onto a viewport. Centring it over a scrim makes the hall the
 * backdrop of the panel instead of a neighbour to it, which is what every
 * game inventory screen is doing.
 *
 * The scrim is deliberately sheer. Blacking the world out would be cheaper to
 * read but throws away the only thing distinguishing this from a website: the
 * room is still there behind the glass.
 */

/* --- frame ------------------------------------------------------------ */

const FRAME_INSET = 6

/**
 * One corner bracket, drawn once and placed four times under rotation.
 *
 * Ornament is what separates a game frame from a bordered div, and a corner is
 * where the eye looks for it — the same reason the pilasters in the hall carry
 * their detail at cap and base rather than up the shaft.
 */
function CornerFiligree({ corner }: { corner: 0 | 1 | 2 | 3 }) {
  const [top, left] = [corner < 2, corner % 3 === 0]
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      aria-hidden
      style={{
        position: 'absolute',
        [top ? 'top' : 'bottom']: `${FRAME_INSET - 1}px`,
        [left ? 'left' : 'right']: `${FRAME_INSET - 1}px`,
        transform: `scale(${left ? 1 : -1}, ${top ? 1 : -1})`,
        pointerEvents: 'none',
      }}
    >
      <path
        d="M1 12 L1 5 Q1 1 5 1 L12 1"
        fill="none"
        stroke={t.brass}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M5 5 L5 9 M5 5 L9 5" fill="none" stroke={t.brassDim} strokeWidth="1.2" />
      <circle cx="12.5" cy="12.5" r="1.6" fill={t.brass} />
    </svg>
  )
}

/** Brass rule with a diamond on it — the divider under every heading. */
function Rule() {
  return (
    <div style={styles.rule}>
      <span style={styles.ruleLine} />
      <span style={styles.ruleDiamond} />
      <span style={styles.ruleLine} />
    </div>
  )
}

/* --- level meter ------------------------------------------------------ */

/**
 * How a skill's proficiency reads at a glance.
 *
 * TODO(hector): implement this. Three shapes worth weighing:
 *
 *   a) Four pips, filled up to `level`. Clean, unmistakably game UI, and
 *      ignores `years` entirely.
 *   b) A continuous bar driven by `years`. Honest, but 8 years of one thing
 *      next to 2 of another makes the short bar look like a weakness rather
 *      than a newer interest.
 *   c) Pips for `level`, with `years` as a small numeral alongside — the two
 *      facts stay separate instead of one standing in for the other.
 *
* `LEVEL_ORDER` (import it from `./panelTheme`) gives the index (`LEVEL_ORDER.indexOf(level)`), `levelRamp`
 * gives the colour for a level. Both are exported from `panelTheme.ts`.
 */
function LevelMeter({ level, years }: { level: Level | string; years?: number }) {
  // Placeholder until the above is decided — the level as a word, so the row
  // is not missing information while the meter is unwritten.
  return (
    <div style={styles.meterRow}>
      <span style={{ ...styles.levelWord, color: levelRamp[level] ?? t.textDim }}>{level}</span>
      {years !== undefined && <span style={styles.years}>{years} yrs</span>}
    </div>
  )
}

/* --- content views ---------------------------------------------------- */

const CONTACT_HOVER: Record<string, string> = {
  email: t.brass,
  linkedin: '#7ec8e3',
  github: t.brassBright,
}

function ContactLink({ kind, href, glyph, label }: { kind: string; href: string; glyph: string; label: string }) {
  return (
    <a
      href={href}
      target={kind === 'email' ? undefined : '_blank'}
      rel={kind === 'email' ? undefined : 'noopener noreferrer'}
      style={styles.contactLink}
      onMouseOver={(e) => (e.currentTarget.style.color = CONTACT_HOVER[kind])}
      onMouseOut={(e) => (e.currentTarget.style.color = t.textDim)}
    >
      <span style={styles.contactGlyph}>{glyph}</span>
      {label}
    </a>
  )
}

function ProfileView({ profile }: { profile: Profile }) {
  const { email, linkedin, github } = profile.contact
  return (
    <>
      <p style={styles.description}>{profile.summary}</p>
      <h3 style={styles.sectionTitle}>Contact</h3>
      <Rule />
      {email && <ContactLink kind="email" href={`mailto:${email}`} glyph="@" label={email} />}
      {linkedin && <ContactLink kind="linkedin" href={`https://${linkedin}`} glyph="in" label={linkedin} />}
      {github && <ContactLink kind="github" href={`https://${github}`} glyph="</>" label={github} />}
    </>
  )
}

/**
 * What the hourglass opens: how long, and nothing else.
 *
 * The numeral carries the whole panel. A career length set in body copy is a
 * sentence you read; set at 5rem in brass it is a number you see, which is the
 * only reason to hang it off an instrument that measures time.
 */
function TimeView({ profile }: { profile: Profile }) {
  return (
    <>
      <div style={styles.numeral}>{profile.yearsExperience}</div>
      <div style={styles.numeralLabel}>
        {profile.yearsExperience === 1 ? 'Year' : 'Years'}
      </div>
      <Rule />
      <p style={{ ...styles.description, ...styles.centred }}>{profile.summary}</p>
    </>
  )
}

/**
 * The Signal Beacon: on-call tooling, and what the rotations actually were.
 *
 * Unlike the version this replaces, it draws no heading of its own — the
 * modal's shared header carries the title, subtitle and opening sentence, so
 * a view that repeated them would print each one twice.
 */
function BeaconView({
  tools,
  experience,
}: {
  tools: string[]
  experience: BeaconExperience
}) {
  const fields: [string, string][] = [
    ['Rotations', experience.rotations],
    ['Escalation', experience.escalation],
    ['Response', experience.response],
  ]
  return (
    <>
      <h3 style={styles.sectionTitle}>Tools</h3>
      <div style={styles.badgeRow}>
        {tools.map((tool) => (
          <span key={tool} style={styles.toolBadge}>
            {tool}
          </span>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Experience</h3>
      {fields.map(([label, value]) => (
        <div key={label} style={styles.skillRow}>
          <div style={styles.skillName}>{label}</div>
          <div style={{ ...styles.skillDescription, marginBottom: 0 }}>{value}</div>
        </div>
      ))}
    </>
  )
}

/**
 * The Observation Ledger: incidents, and what each one taught.
 *
 * Cards take a teal edge where the skill rows take brass. They are the same
 * row in the same frame, and the palette is already split warm/cool, so the
 * edge colour is the cheapest way to say these are a different kind of thing.
 */
function LedgerView({ incidents }: { incidents: IncidentRecord[] }) {
  return (
    <>
      <h3 style={styles.sectionTitle}>Incident Records</h3>
      {incidents.map((incident) => (
        <div key={incident.id} style={styles.incidentCard}>
          <div style={styles.skillName}>{incident.summary}</div>
          <div style={styles.incidentRole}>{incident.role}</div>
          <p style={styles.incidentLearnings}>{incident.learnings}</p>
        </div>
      ))}
    </>
  )
}

function SkillRow({ item }: { item: SkillItem }) {
  return (
    <div style={styles.skillRow}>
      <div style={styles.skillName}>{item.title}</div>
      <div style={styles.skillDescription}>{item.description}</div>
      <LevelMeter level={item.level} years={item.years} />
    </div>
  )
}

/* --- shell ------------------------------------------------------------ */

const TITLE_ID = 'info-panel-title'

/**
 * Views whose heading is not in cv.json's content index.
 *
 * This was a ternary chain and stopped being readable at the third branch.
 * `lede` lives here too because these views want an opening sentence and the
 * area views take theirs from `area.description`.
 */
const FIXED_VIEWS: Record<string, { heading: string; subheading: string; lede?: string }> = {
  [HOURGLASS_CONTENT_ID]: { heading: 'The Hourglass', subheading: 'Time & Experience' },
  beacon: {
    heading: 'Signal Beacon',
    subheading: 'On-Call & Incident Response',
    lede: 'Coordinating alerts and managing incident response across teams.',
  },
  ledger: {
    heading: 'Observation Ledger',
    subheading: 'Incident History & Learnings',
    lede: 'A record of notable incidents and the lessons learned from them.',
  },
}

export default function InfoPanel() {
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const { getContentById, getProfile, getObservatoryData } = useCVData()

  const isProfileView = activeInfoPoint === 'profile'
  const isTimeView = activeInfoPoint === HOURGLASS_CONTENT_ID
  const isBeaconView = activeInfoPoint === 'beacon'
  const isLedgerView = activeInfoPoint === 'ledger'
  // These are backed by `profile` or `observatory`, not by the content index.
  // Looking them up there returns null, which drops the panel onto the
  // "Loading…" path and leaves it there.
  const isFixedView = activeInfoPoint !== null && activeInfoPoint in FIXED_VIEWS
  const profile = getProfile()
  const observatory = getObservatoryData()
  const content =
    activeInfoPoint && !isProfileView && !isFixedView ? getContentById(activeInfoPoint) : null

  const close = () => setActiveInfoPoint(null)

  // Listening on `window` rather than the dialog, so Escape works whether
  // focus landed in the panel or is still on the canvas the click came from.
  useEffect(() => {
    if (!activeInfoPoint) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveInfoPoint(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeInfoPoint, setActiveInfoPoint])

  // Nothing mounted when closed. The old drawer stayed in the tree at
  // translateX(100%), which keeps a transformed fixed element composited on
  // the GPU permanently, beside a canvas already short on fragment budget.
  if (!activeInfoPoint) return null

  const isArea = content !== null && 'items' in content
  const area = isArea ? (content as Area) : null
  const skill = content !== null && !isArea ? (content as SkillItem) : null

  const fixed = FIXED_VIEWS[activeInfoPoint]
  const heading = fixed?.heading ?? (isProfileView ? profile?.name : (area?.name ?? skill?.title))
  const subheading = fixed?.subheading ?? (isProfileView ? profile?.title : area?.category)
  const lede = fixed?.lede ?? area?.description

  return (
    <div
      data-testid="info-panel-scrim"
      style={styles.scrim}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        style={styles.dialog}
        // The scrim closes on click, and a click inside the panel bubbles up
        // to it. Without this, selecting text in the description closes it.
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.frameInner} aria-hidden />
        {([0, 1, 2, 3] as const).map((c) => (
          <CornerFiligree key={c} corner={c} />
        ))}

        <button style={styles.close} onClick={close} aria-label="Close">
          &times;
        </button>

        <header style={styles.header}>
          <h2 id={TITLE_ID} style={styles.title}>
            {heading ?? '…'}
          </h2>
          {subheading && <div style={styles.subtitle}>{subheading}</div>}
          {/* The lede sits above the rule on purpose. Below it, the rule
              separates the title from everything, which folds the description
              into the body and makes it the first of several grey slabs.
              Above, the rule separates the statement from the detail. */}
          {lede && <p style={styles.lede}>{lede}</p>}
          <Rule />
        </header>

        <div style={styles.body}>
          {isTimeView && profile && <TimeView profile={profile} />}

          {isProfileView && profile && <ProfileView profile={profile} />}

          {isBeaconView && observatory && (
            <BeaconView
              tools={observatory.beacon.tools}
              experience={observatory.beacon.experience}
            />
          )}

          {isLedgerView && observatory && (
            <LedgerView incidents={observatory.ledger.incidents} />
          )}

          {(isBeaconView || isLedgerView) && !observatory && (
            <p style={styles.description}>Loading&hellip;</p>
          )}

          {area && (
            <>
              {area.items.length > 0 && (
                <>
                  <h3 style={styles.sectionTitle}>Skills</h3>
                  {area.items.map((item) => (
                    <SkillRow key={item.id} item={item} />
                  ))}
                </>
              )}
            </>
          )}

          {skill && (
            <>
              <p style={styles.description}>{skill.description}</p>
              <LevelMeter level={skill.level} years={skill.years} />
            </>
          )}

          {!isProfileView && !isFixedView && !content && (
            <p style={styles.description}>Loading&hellip;</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* --- styles ----------------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  scrim: {
    position: 'fixed',
    inset: 0,
    // Above the map (100) and below the app's own cursor (9999).
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: t.scrim,
    backdropFilter: 'blur(2px)',
    animation: 'scrim-in 140ms ease-out',
  },
  dialog: {
    position: 'relative',
    width: 'min(680px, 92vw)',
    maxHeight: '78vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.6rem 1.8rem 1.5rem',
    backgroundColor: t.ink,
    border: `2px solid ${t.edge}`,
    boxShadow: `${t.shadow}, ${t.glow}`,
    // Square. A radius here is the single most "web dialog" thing the old
    // panel did — cut stone and cast brass do not have soft corners.
    borderRadius: 0,
    animation: 'panel-in 170ms cubic-bezier(0.2, 0.9, 0.3, 1)',
  },
  /** Hairline inside the frame. Two lines with a gap read as moulding. */
  frameInner: {
    position: 'absolute',
    inset: `${FRAME_INSET}px`,
    border: `1px solid ${t.edgeInner}`,
    pointerEvents: 'none',
  },
  close: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.9rem',
    background: 'none',
    border: 'none',
    color: t.brassDim,
    fontSize: '1.6rem',
    lineHeight: 1,
    padding: '0.25rem 0.4rem',
    cursor: 'pointer',
  },
  header: {
    flex: '0 0 auto',
    paddingRight: '2rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
    color: t.brass,
    textShadow: '0 1px 3px rgba(0,0,0,0.7)',
  },
  subtitle: {
    marginTop: '0.2rem',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: t.textDim,
  },
  rule: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.8rem 0 1rem',
  },
  ruleLine: {
    flex: 1,
    height: '1px',
    backgroundColor: t.edgeInner,
  },
  ruleDiamond: {
    width: '6px',
    height: '6px',
    backgroundColor: t.brass,
    transform: 'rotate(45deg)',
  },
  body: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    // The frame must never scroll off, so the body scrolls inside it. The gap
    // keeps text off the inset hairline.
    paddingRight: '0.4rem',
  },
  /**
   * Prose, capped at a readable measure.
   *
   * The dialog is 680px and text used to run its full width — roughly 95
   * characters a line, well past the 60-75 where the eye reliably finds the
   * start of the next one. `ch` is the width of a `0` in the current font, so
   * the cap tracks the type scale instead of needing a px value re-tuned every
   * time the sizes move.
   */
  description: {
    fontSize: '0.98rem',
    lineHeight: 1.7,
    color: t.text,
    maxWidth: '62ch',
    marginBottom: '1.4rem',
  },
  centred: {
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
  /** The area's own line, set as an epigraph rather than as body copy. */
  lede: {
    marginTop: '0.7rem',
    fontSize: '1.06rem',
    lineHeight: 1.6,
    color: t.brassDim,
    maxWidth: '58ch',
  },
  numeral: {
    marginTop: '0.5rem',
    textAlign: 'center',
    fontSize: '5rem',
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: t.brass,
    // The hall's glows are emissive materials over bloom; the DOM has no
    // bloom, so the halo has to be painted on.
    textShadow: '0 0 26px rgba(255, 210, 122, 0.45), 0 2px 6px rgba(0,0,0,0.8)',
    fontVariantNumeric: 'tabular-nums',
  },
  numeralLabel: {
    marginTop: '0.3rem',
    textAlign: 'center',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.32em',
    // Indented by the tracking, so the letterspacing does not push the word
    // visually right of the numeral it sits under.
    textIndent: '0.32em',
    color: t.textDim,
  },
  sectionTitle: {
    marginBottom: '0.8rem',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: t.brassDim,
  },
  skillRow: {
    marginBottom: '0.9rem',
    padding: '1.05rem 1.15rem',
    backgroundColor: t.inkRaised,
    // Brass edge on one side only. A full border makes a card; a single rule
    // makes a row in a list, which is what a stat block is.
    borderLeft: `2px solid ${t.edgeInner}`,
  },
  // The gap between title and body is doing the skimming: a bright 1.02rem
  // title over dim 0.85rem copy lets the eye land on titles and stop, which is
  // what makes a stack of paragraphs scannable without hiding any of it.
  skillName: {
    fontSize: '1.02rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    color: t.brassBright,
    marginBottom: '0.35rem',
  },
  skillDescription: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    color: t.textDim,
    maxWidth: '62ch',
    marginBottom: '0.75rem',
  },
  meterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  levelWord: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  years: {
    fontSize: '0.72rem',
    color: t.textDim,
    letterSpacing: '0.06em',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.4rem',
  },
  toolBadge: {
    padding: '0.3rem 0.7rem',
    fontSize: '0.8rem',
    letterSpacing: '0.04em',
    color: t.brass,
    backgroundColor: t.inkRaised,
    border: `1px solid ${t.edgeInner}`,
  },
  incidentCard: {
    marginBottom: '0.9rem',
    padding: '1.05rem 1.15rem',
    backgroundColor: t.inkRaised,
    borderLeft: `2px solid ${t.teal}`,
  },
  incidentRole: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: t.teal,
    marginBottom: '0.6rem',
  },
  incidentLearnings: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    fontStyle: 'italic',
    color: t.textDim,
    maxWidth: '62ch',
  },
  contactLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: t.textDim,
    textDecoration: 'none',
    padding: '0.45rem 0',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  contactGlyph: {
    width: '24px',
    fontSize: '0.8rem',
    color: t.brassDim,
  },
}
