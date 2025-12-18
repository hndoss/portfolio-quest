import { useGameStore } from '../../stores/gameStore'
import { useCVData } from '../../hooks/useCVData'
import type { SkillItem, Area, Profile } from '../../types/cv'

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

export default function InfoPanel() {
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const { getContentById, getProfile } = useCVData()

  const isProfileView = activeInfoPoint === 'profile'
  const profile = getProfile()
  const content = activeInfoPoint && !isProfileView ? getContentById(activeInfoPoint) : null

  const handleClose = () => {
    setActiveInfoPoint(null)
  }

  // Loading state - only show if we have an active point but no content yet
  if (activeInfoPoint && !isProfileView && !content) {
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
