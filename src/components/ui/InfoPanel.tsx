import { useGameStore } from '../../stores/gameStore'
import { useCVData } from '../../hooks/useCVData'
import type { SkillItem, Area, Profile, BeaconExperience, IncidentRecord } from '../../types/cv'

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '400px',
    maxWidth: '90vw',
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    color: '#fff',
    padding: '2rem',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
    overflowY: 'auto',
    zIndex: 200,
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease-out',
  },
  hidden: {
    transform: 'translateX(100%)',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#00ff88',
  },
  category: {
    fontSize: '0.875rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#ccc',
    marginBottom: '1.5rem',
  },
  skillsTitle: {
    fontSize: '1rem',
    color: '#00ff88',
    marginBottom: '1rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem',
  },
  skillItem: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  skillName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  skillDescription: {
    fontSize: '0.875rem',
    color: '#aaa',
    marginBottom: '0.5rem',
  },
  skillMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  levelBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
  },
}

const levelColors: Record<string, string> = {
  beginner: '#666',
  intermediate: '#4a9eff',
  advanced: '#00ff88',
  expert: '#ffcc00',
}

const observatoryStyles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontSize: '1rem',
    color: '#ff9944',
    marginBottom: '0.75rem',
    marginTop: '1.5rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem',
  },
  toolBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'rgba(255, 153, 68, 0.2)',
    borderRadius: '4px',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    color: '#ff9944',
  },
  experienceItem: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  experienceLabel: {
    fontSize: '0.85rem',
    color: '#ff9944',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  experienceValue: {
    fontSize: '0.95rem',
    color: '#ccc',
    lineHeight: 1.5,
  },
  incidentCard: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    borderLeft: '3px solid #aaaaaa',
  },
  incidentSummary: {
    fontSize: '0.95rem',
    color: '#fff',
    marginBottom: '0.5rem',
    lineHeight: 1.4,
  },
  incidentRole: {
    fontSize: '0.8rem',
    color: '#aaaaaa',
    marginBottom: '0.5rem',
  },
  incidentLearnings: {
    fontSize: '0.85rem',
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
}

const profileStyles: Record<string, React.CSSProperties> = {
  profileName: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
    color: '#00ff88',
  },
  profileTitle: {
    fontSize: '1.1rem',
    color: '#888',
    marginBottom: '1.5rem',
  },
  profileSummary: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#ccc',
    marginBottom: '2rem',
  },
  contactSection: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #333',
  },
  contactTitle: {
    fontSize: '1rem',
    color: '#00ff88',
    marginBottom: '1rem',
  },
  contactLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#888',
    textDecoration: 'none',
    padding: '0.5rem 0',
    transition: 'color 0.2s',
    fontSize: '0.95rem',
  },
  contactIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
}

function ProfileDisplay({ profile }: { profile: Profile }) {
  return (
    <>
      <h1 style={profileStyles.profileName}>{profile.name}</h1>
      <div style={profileStyles.profileTitle}>{profile.title}</div>
      <p style={profileStyles.profileSummary}>{profile.summary}</p>

      <div style={profileStyles.contactSection}>
        <h3 style={profileStyles.contactTitle}>Contact</h3>
        {profile.contact.email && (
          <a
            href={`mailto:${profile.contact.email}`}
            style={profileStyles.contactLink}
            onMouseOver={(e) => (e.currentTarget.style.color = '#00ff88')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
          >
            <span style={profileStyles.contactIcon}>@</span>
            {profile.contact.email}
          </a>
        )}
        {profile.contact.linkedin && (
          <a
            href={`https://${profile.contact.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            style={profileStyles.contactLink}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0077b5')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
          >
            <span style={profileStyles.contactIcon}>in</span>
            {profile.contact.linkedin}
          </a>
        )}
        {profile.contact.github && (
          <a
            href={`https://${profile.contact.github}`}
            target="_blank"
            rel="noopener noreferrer"
            style={profileStyles.contactLink}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
          >
            <span style={profileStyles.contactIcon}>&lt;/&gt;</span>
            {profile.contact.github}
          </a>
        )}
      </div>
    </>
  )
}

interface BeaconDisplayProps {
  tools: string[]
  experience: BeaconExperience
}

function BeaconDisplay({ tools, experience }: BeaconDisplayProps) {
  return (
    <>
      <h2 style={{ ...styles.title, color: '#ff9944' }}>Signal Beacon</h2>
      <div style={styles.category}>On-Call & Incident Response</div>
      <p style={styles.description}>
        Coordinating alerts and managing incident response across teams.
      </p>

      <h3 style={observatoryStyles.sectionTitle}>Tools</h3>
      <div>
        {tools.map((tool) => (
          <span key={tool} style={observatoryStyles.toolBadge}>
            {tool}
          </span>
        ))}
      </div>

      <h3 style={observatoryStyles.sectionTitle}>Experience</h3>
      <div style={observatoryStyles.experienceItem}>
        <div style={observatoryStyles.experienceLabel}>Rotations</div>
        <div style={observatoryStyles.experienceValue}>{experience.rotations}</div>
      </div>
      <div style={observatoryStyles.experienceItem}>
        <div style={observatoryStyles.experienceLabel}>Escalation</div>
        <div style={observatoryStyles.experienceValue}>{experience.escalation}</div>
      </div>
      <div style={observatoryStyles.experienceItem}>
        <div style={observatoryStyles.experienceLabel}>Response</div>
        <div style={observatoryStyles.experienceValue}>{experience.response}</div>
      </div>
    </>
  )
}

interface LedgerDisplayProps {
  incidents: IncidentRecord[]
}

function LedgerDisplay({ incidents }: LedgerDisplayProps) {
  return (
    <>
      <h2 style={{ ...styles.title, color: '#aaaaaa' }}>Observation Ledger</h2>
      <div style={styles.category}>Incident History & Learnings</div>
      <p style={styles.description}>
        A record of notable incidents and the lessons learned from them.
      </p>

      <h3 style={observatoryStyles.sectionTitle}>Incident Records</h3>
      {incidents.map((incident) => (
        <div key={incident.id} style={observatoryStyles.incidentCard}>
          <div style={observatoryStyles.incidentSummary}>{incident.summary}</div>
          <div style={observatoryStyles.incidentRole}>Role: {incident.role}</div>
          <div style={observatoryStyles.incidentLearnings}>
            "{incident.learnings}"
          </div>
        </div>
      ))}
    </>
  )
}

export default function InfoPanel() {
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const { getContentById, getProfile, getObservatoryData } = useCVData()

  const isProfileView = activeInfoPoint === 'profile'
  const isBeaconView = activeInfoPoint === 'beacon'
  const isLedgerView = activeInfoPoint === 'ledger'
  const isObservatoryView = isBeaconView || isLedgerView

  const profile = getProfile()
  const observatoryData = getObservatoryData()
  const content = activeInfoPoint && !isProfileView && !isObservatoryView ? getContentById(activeInfoPoint) : null

  const handleClose = () => {
    setActiveInfoPoint(null)
  }

  // Loading state - only show if we have an active point but no content yet
  if (activeInfoPoint && !isProfileView && !isObservatoryView && !content) {
    return (
      <div style={{ ...styles.overlay }}>
        <button style={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        <p>Loading...</p>
      </div>
    )
  }

  // Loading state for observatory views
  if (isObservatoryView && !observatoryData) {
    return (
      <div style={{ ...styles.overlay }}>
        <button style={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        <p>Loading...</p>
      </div>
    )
  }

  // Hidden state
  if (!activeInfoPoint) {
    return <div style={{ ...styles.overlay, ...styles.hidden }} />
  }

  // Check content type
  const isArea = content && 'items' in content
  const area = isArea ? (content as Area) : null
  const skill = content && !isArea ? (content as SkillItem) : null

  return (
    <div style={styles.overlay}>
      <button style={styles.closeButton} onClick={handleClose}>
        &times;
      </button>

      {isProfileView && profile && <ProfileDisplay profile={profile} />}

      {isBeaconView && observatoryData && (
        <BeaconDisplay
          tools={observatoryData.beacon.tools}
          experience={observatoryData.beacon.experience}
        />
      )}

      {isLedgerView && observatoryData && (
        <LedgerDisplay incidents={observatoryData.ledger.incidents} />
      )}

      {area && (
        <>
          <h2 style={styles.title}>{area.name}</h2>
          <div style={styles.category}>{area.category}</div>
          <p style={styles.description}>{area.description}</p>

          {area.items.length > 0 && (
            <>
              <h3 style={styles.skillsTitle}>Skills</h3>
              {area.items.map((item) => (
                <div key={item.id} style={styles.skillItem}>
                  <div style={styles.skillName}>{item.title}</div>
                  <div style={styles.skillDescription}>{item.description}</div>
                  <div style={styles.skillMeta}>
                    <span
                      style={{
                        ...styles.levelBadge,
                        backgroundColor: levelColors[item.level] || '#666',
                        color: item.level === 'expert' ? '#000' : '#fff',
                      }}
                    >
                      {item.level}
                    </span>
                    {item.years && <span>{item.years} years</span>}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {skill && (
        <>
          <h2 style={styles.title}>{skill.title}</h2>
          <p style={styles.description}>{skill.description}</p>
          <div style={styles.skillMeta}>
            <span
              style={{
                ...styles.levelBadge,
                backgroundColor: levelColors[skill.level] || '#666',
                color: skill.level === 'expert' ? '#000' : '#fff',
              }}
            >
              {skill.level}
            </span>
            {skill.years && <span>{skill.years} years experience</span>}
          </div>
        </>
      )}
    </div>
  )
}
