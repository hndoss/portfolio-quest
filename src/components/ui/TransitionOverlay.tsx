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
  },
}

export default function TransitionOverlay() {
  const isTransitioning = useGameStore((state) => state.isTransitioning)

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isTransitioning ? 0.3 : 0,
      }}
    />
  )
}
