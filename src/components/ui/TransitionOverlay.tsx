import { useGameStore } from '../../stores/gameStore'

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    pointerEvents: 'none',
    zIndex: 50,
    transition: 'opacity 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#00ff88',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#888',
    fontSize: '0.875rem',
    letterSpacing: '0.1em',
  },
}

// Inject keyframes for spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
if (!document.head.querySelector('[data-transition-overlay]')) {
  styleSheet.setAttribute('data-transition-overlay', '')
  document.head.appendChild(styleSheet)
}

export default function TransitionOverlay() {
  const isTransitioning = useGameStore((state) => state.isTransitioning)

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isTransitioning ? 0.4 : 0,
      }}
    >
      {isTransitioning && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <div style={styles.text}>Traveling...</div>
        </div>
      )}
    </div>
  )
}
