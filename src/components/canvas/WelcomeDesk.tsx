import Prop from './Prop'

const MODELS = '/models/props'

/** Height of the desk's counter surface, from the Blender source. */
const COUNTER_HEIGHT = 1.12

/**
 * Curved reception counter for the welcome hall, with its three props.
 *
 * Placements come from the Blender scene (assets/blender/props/desk-props.blend)
 * converted to three.js axes, so the props sit on the counter's arc rather than
 * on a straight line. Every model is grounded to y = 0 at export, which is why
 * the props sit at exactly COUNTER_HEIGHT with no fudge offset.
 */
export type DeskItem = 'bell' | 'quill' | 'hourglass'

export default function WelcomeDesk({
  position = [0, 0, 4.5],
  onSelect,
}: {
  position?: [number, number, number]
  onSelect?: (item: DeskItem) => void
}) {
  return (
    <group position={position}>
      <Prop url={`${MODELS}/welcome-desk.glb`} />
      <Prop
        url={`${MODELS}/desk-bell.glb`}
        position={[-0.643, COUNTER_HEIGHT, 0.087]}
        rotation={[0, -0.227, 0]}
        onSelect={() => onSelect?.('bell')}
      />
      <Prop
        url={`${MODELS}/quill-inkpot.glb`}
        position={[0.075, COUNTER_HEIGHT, 0.16]}
        rotation={[0, 0.026, 0]}
        onSelect={() => onSelect?.('quill')}
      />
      <Prop
        url={`${MODELS}/hourglass.glb`}
        position={[0.692, COUNTER_HEIGHT, 0.076]}
        rotation={[0, 0.244, 0]}
        onSelect={() => onSelect?.('hourglass')}
      />
    </group>
  )
}
