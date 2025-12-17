import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'

const areaNames: Record<string, string> = {
  'central-hall': 'Central Hall',
  library: 'Library',
  forge: 'Forge',
  pipelines: 'Pipelines',
  treasury: 'Treasury',
  watchtower: 'Watchtower',
}

const viewpointLabels: Record<string, string> = {
  'hall-entrance': 'Entrance',
  'hall-center': 'Center',
  'hall-north': 'North',
  'hall-west': 'West Wing',
  'hall-east': 'East Wing',
  'library-entrance': 'Entrance',
  'library-center': 'Reading Area',
  'library-shelves': 'Shelves',
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#fff',
    fontSize: '0.875rem',
  },
  area: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  separator: {
    color: '#666',
  },
  viewpoint: {
    color: '#aaa',
  },
}

export default function Breadcrumb() {
  const currentArea = useGameStore((state) => state.currentArea)
  const { currentViewpointData } = useNavigation()

  const areaLabel = areaNames[currentArea] || currentArea
  const viewpointLabel = currentViewpointData
    ? viewpointLabels[currentViewpointData.id] || ''
    : ''

  return (
    <div style={styles.container}>
      <span style={styles.area}>{areaLabel}</span>
      {viewpointLabel && (
        <>
          <span style={styles.separator}>/</span>
          <span style={styles.viewpoint}>{viewpointLabel}</span>
        </>
      )}
    </div>
  )
}
