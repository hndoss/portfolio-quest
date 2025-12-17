import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'

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
  tooltip: {
    position: 'fixed',
    bottom: '3rem',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '1rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
}

export default function HUD() {
  const currentArea = useGameStore((state) => state.currentArea)
  const isLoading = useGameStore((state) => state.isLoading)
  const hoveredHotspot = useGameStore((state) => state.hoveredHotspot)
  const { currentViewpointData } = useNavigation()

  if (isLoading) return null

  // Find the label for the hovered hotspot
  const hotspotLabel = hoveredHotspot
    ? currentViewpointData?.hotspots.find((h) => h.id === hoveredHotspot)?.label
    : null

  return (
    <>
      <div style={styles.container}>
        <div style={styles.areaName}>{areaNames[currentArea]}</div>
      </div>
      <div style={styles.controls}>Click on glowing orbs to navigate</div>
      {hotspotLabel && <div style={styles.tooltip}>{hotspotLabel}</div>}
    </>
  )
}
