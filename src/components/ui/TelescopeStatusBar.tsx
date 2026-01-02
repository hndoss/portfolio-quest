import { useGameStore } from '../../stores/gameStore'
import { useCVData } from '../../hooks/useCVData'

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '8px',
    border: '1px solid #333',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    zIndex: 200,
  },
  toolName: {
    color: '#ffdd44',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  separator: {
    color: '#444',
  },
  context: {
    color: '#88aadd',
  },
  verb: {
    color: '#00ff88',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
  },
  exitHint: {
    marginLeft: '1rem',
    color: '#666',
    fontSize: '0.75rem',
  },
  exitButton: {
    marginLeft: '0.5rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },
}

export default function TelescopeStatusBar() {
  const telescopeMode = useGameStore((state) => state.telescopeMode)
  const focusedTool = useGameStore((state) => state.focusedTool)
  const exitTelescopeMode = useGameStore((state) => state.exitTelescopeMode)
  const { getTelescopeTool } = useCVData()

  if (!telescopeMode) return null

  const tool = focusedTool ? getTelescopeTool(focusedTool) : null

  if (!tool) {
    return (
      <div style={styles.container}>
        <span style={styles.toolName}>Telescope Mode</span>
        <span style={styles.separator}>·</span>
        <span style={styles.context}>Use arrow keys to navigate</span>
        <span style={styles.exitHint}>ESC to exit</span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <span style={styles.toolName}>{tool.name}</span>
      <span style={styles.separator}>·</span>
      <span style={styles.context}>{tool.context}</span>
      <span style={styles.separator}>·</span>
      <span style={styles.verb}>{tool.verb}</span>
      <span style={styles.exitHint}>
        ESC to exit
        <button
          style={styles.exitButton}
          onClick={exitTelescopeMode}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#888'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#444'
            e.currentTarget.style.color = '#888'
          }}
        >
          Exit
        </button>
      </span>
    </div>
  )
}
