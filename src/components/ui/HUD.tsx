import { useGameStore } from '../../stores/gameStore'

const areaNames: Record<string, string> = {
  'central-hall': 'Central Hall',
  library: 'The Library',
  forge: 'The Forge',
  pipelines: 'The Pipelines',
  treasury: 'The Treasury',
  watchtower: 'The Watchtower',
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    padding: '1rem',
    pointerEvents: 'none',
    zIndex: 100,
  },
  areaName: {
    color: '#fff',
    fontSize: '1.25rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  controls: {
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    color: '#aaa',
    fontSize: '0.875rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  crosshair: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '4px',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '50%',
  },
}

export default function HUD() {
  const currentArea = useGameStore((state) => state.currentArea)
  const isLoading = useGameStore((state) => state.isLoading)

  if (isLoading) return null

  return (
    <>
      <div style={styles.container}>
        <div style={styles.areaName}>{areaNames[currentArea]}</div>
      </div>
      <div style={styles.controls}>
        WASD to move | Click to look around
      </div>
      <div style={styles.crosshair} />
    </>
  )
}
