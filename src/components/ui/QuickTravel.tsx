import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'
import type { AreaId } from '../../types/game'

const areaData: { id: AreaId; name: string; defaultViewpoint: string }[] = [
  { id: 'central-hall', name: 'Central Hall', defaultViewpoint: 'hall-center' },
  { id: 'library', name: 'The Library', defaultViewpoint: 'library-entrance' },
  { id: 'forge', name: 'The Forge', defaultViewpoint: 'forge-entrance' },
  { id: 'pipelines', name: 'The Pipelines', defaultViewpoint: 'pipelines-entrance' },
  { id: 'treasury', name: 'The Treasury', defaultViewpoint: 'treasury-entrance' },
  { id: 'observatory', name: 'The Observatory', defaultViewpoint: 'observatory-entrance' },
]

const styles: Record<string, React.CSSProperties> = {
  button: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    zIndex: 100,
    transition: 'all 0.2s ease',
  },
  buttonHover: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderColor: '#00ff88',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  menu: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  title: {
    color: '#00ff88',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    borderBottom: '1px solid #333',
    paddingBottom: '1rem',
  },
  areaList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  areaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1rem',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  areaButtonActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  areaName: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  visitedBadge: {
    fontSize: '0.7rem',
    color: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  currentBadge: {
    fontSize: '0.7rem',
    color: '#ffcc00',
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  lockedBadge: {
    fontSize: '0.7rem',
    color: '#666',
  },
  closeButton: {
    marginTop: '1.5rem',
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #666',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
}

export default function QuickTravel() {
  const isOpen = useGameStore((state) => state.isQuickTravelOpen)
  const setOpen = useGameStore((state) => state.setQuickTravelOpen)
  const visitedAreas = useGameStore((state) => state.visitedAreas)
  const currentArea = useGameStore((state) => state.currentArea)
  const isTransitioning = useGameStore((state) => state.isTransitioning)
  const navigateTo = useGameStore((state) => state.navigateTo)
  const { viewpoints } = useNavigation()

  const handleAreaClick = (areaId: AreaId, defaultViewpoint: string) => {
    if (areaId === currentArea || !visitedAreas.has(areaId) || isTransitioning) return

    // Find if the viewpoint exists
    const viewpoint = viewpoints.find((v) => v.id === defaultViewpoint)
    if (viewpoint) {
      navigateTo(defaultViewpoint)
      setOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        style={styles.button}
        onClick={() => setOpen(true)}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.buttonHover)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
          e.currentTarget.style.borderColor = '#444'
        }}
      >
        Quick Travel
      </button>
    )
  }

  return (
    <div style={styles.overlay} onClick={() => setOpen(false)}>
      <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Quick Travel</h2>
        <div style={styles.areaList}>
          {areaData.map((area) => {
            const isVisited = visitedAreas.has(area.id)
            const isCurrent = currentArea === area.id
            const isLocked = !isVisited

            return (
              <button
                key={area.id}
                style={{
                  ...styles.areaButton,
                  ...(isCurrent ? styles.areaButtonActive : {}),
                  ...(isLocked ? styles.areaButtonDisabled : {}),
                }}
                onClick={() => handleAreaClick(area.id, area.defaultViewpoint)}
                disabled={isLocked || isCurrent}
              >
                <span style={styles.areaName}>{area.name}</span>
                {isCurrent && <span style={styles.currentBadge}>Current</span>}
                {!isCurrent && isVisited && <span style={styles.visitedBadge}>Visited</span>}
                {isLocked && <span style={styles.lockedBadge}>Not discovered</span>}
              </button>
            )
          })}
        </div>
        <button
          style={styles.closeButton}
          onClick={() => setOpen(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#888'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#666'
            e.currentTarget.style.color = '#aaa'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
