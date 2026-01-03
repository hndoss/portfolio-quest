import { useGameStore } from '../../../stores/gameStore'

const ROOM_RADIUS = 6
const WALL_HEIGHT = 8
const WALL_THICKNESS = 0.4

export default function Observatory() {
  return (
    <group position={[0, 0, -30]}>
      {/* Subdued ambient lighting - dark room */}
      <pointLight
        position={[0, 6, 0]}
        color="#4466aa"
        intensity={3}
        distance={20}
        decay={2}
      />

      {/* Window/sky light coming in (aligned with telescope) */}
      <pointLight
        position={[0, 5, -5]}
        color="#aaccff"
        intensity={6}
        distance={12}
        decay={2}
      />

      {/* Floor - circular stone */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[ROOM_RADIUS, 24]} />
        <meshStandardMaterial color="#2a2a30" />
      </mesh>

      {/* Ceiling - domed */}
      <mesh position={[0, WALL_HEIGHT + 1, 0]}>
        <sphereGeometry args={[ROOM_RADIUS, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a20" side={1} />
      </mesh>

      {/* Circular wall with windows */}
      <CircularWall />

      {/* Doorway to Central Hall (south side) */}
      <Doorway position={[0, 0, ROOM_RADIUS - 0.2]} />

      {/* === THREE CONTAINERS === */}

      {/* PRIMARY: Telescope - center-forward, aligned with sky opening */}
      <Telescope position={[0, 0, -1.5]} />

      {/* SECONDARY: Beacon + Control Desk - right side of telescope */}
      <BeaconDesk position={[3, 0, -1]} />

      {/* TERTIARY: Observation Ledger - left wall, wall-mounted */}
      <Ledger position={[-5.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  )
}

function CircularWall() {
  const segments = 16
  // Window at segment 0 (north, aligned with telescope view)
  const windowSegments = [0]

  return (
    <group>
      {[...Array(segments)].map((_, i) => {
        const angle = (i / segments) * Math.PI * 2
        const nextAngle = ((i + 1) / segments) * Math.PI * 2
        const midAngle = (angle + nextAngle) / 2

        // Skip the doorway segment (facing south, around segment 8)
        if (i === 8) return null

        const hasWindow = windowSegments.includes(i)
        const x = Math.sin(midAngle) * (ROOM_RADIUS - WALL_THICKNESS / 2)
        const z = Math.cos(midAngle) * (ROOM_RADIUS - WALL_THICKNESS / 2)

        return (
          <group key={i}>
            {hasWindow ? (
              <WallSegmentWithWindow
                position={[x, 0, z]}
                rotation={[0, midAngle, 0]}
              />
            ) : (
              <mesh
                castShadow
                receiveShadow
                position={[x, WALL_HEIGHT / 2, z]}
                rotation={[0, midAngle, 0]}
              >
                <boxGeometry args={[2.4, WALL_HEIGHT, WALL_THICKNESS]} />
                <meshStandardMaterial color="#3a3a40" />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

interface WallSegmentWithWindowProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

function WallSegmentWithWindow({ position, rotation }: WallSegmentWithWindowProps) {
  const windowWidth = 2
  const windowHeight = 3
  const windowBottom = 3

  return (
    <group position={position} rotation={rotation}>
      {/* Bottom section */}
      <mesh castShadow receiveShadow position={[0, windowBottom / 2, 0]}>
        <boxGeometry args={[2.4, windowBottom, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Left section */}
      <mesh castShadow receiveShadow position={[-(windowWidth / 2 + 0.2), windowBottom + windowHeight / 2, 0]}>
        <boxGeometry args={[0.4, windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Right section */}
      <mesh castShadow receiveShadow position={[(windowWidth / 2 + 0.2), windowBottom + windowHeight / 2, 0]}>
        <boxGeometry args={[0.4, windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Top section */}
      <mesh castShadow receiveShadow position={[0, windowBottom + windowHeight + (WALL_HEIGHT - windowBottom - windowHeight) / 2, 0]}>
        <boxGeometry args={[2.4, WALL_HEIGHT - windowBottom - windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Window "glass" - night sky */}
      <mesh position={[0, windowBottom + windowHeight / 2, 0.1]}>
        <planeGeometry args={[windowWidth, windowHeight]} />
        <meshStandardMaterial
          color="#050510"
          emissive="#0a0a20"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Stars in window */}
      {[
        [0, 0.5], [-0.3, 0.8], [0.4, 0.3], [-0.5, -0.2], [0.3, -0.5],
        [-0.2, 0.2], [0.6, 0.7], [-0.6, 0.5], [0.1, -0.8], [-0.4, -0.6],
      ].map(([x, y], i) => (
        <mesh
          key={i}
          position={[x, windowBottom + windowHeight / 2 + y, 0.12]}
        >
          <circleGeometry args={[0.015 + (i % 3) * 0.01, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  )
}

interface DoorwayProps {
  position: [number, number, number]
}

function Doorway({ position }: DoorwayProps) {
  const doorHeight = 3

  return (
    <group position={position}>
      {/* Top arch */}
      <mesh castShadow position={[0, doorHeight + (WALL_HEIGHT - doorHeight) / 2, 0]}>
        <boxGeometry args={[2.4, WALL_HEIGHT - doorHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
    </group>
  )
}

interface TelescopeProps {
  position: [number, number, number]
}

function Telescope({ position }: TelescopeProps) {
  const enterTelescopeMode = useGameStore((state) => state.enterTelescopeMode)
  const telescopeMode = useGameStore((state) => state.telescopeMode)

  const handleClick = () => {
    if (!telescopeMode) {
      enterTelescopeMode()
    }
  }

  return (
    <group position={position}>
      {/* Spotlight on telescope - PRIMARY focus */}
      <pointLight
        position={[0, 3, 0]}
        color="#aaccff"
        intensity={8}
        distance={6}
        decay={2}
      />

      {/* Clickable area for telescope */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <cylinderGeometry args={[1.5, 1.5, 2.5, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Rotating platform */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.2, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Tripod legs */}
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.sin(angle) * 0.6, 0.8, Math.cos(angle) * 0.6]}
          rotation={[Math.PI / 12 * Math.cos(angle), 0, Math.PI / 12 * Math.sin(angle)]}
        >
          <cylinderGeometry args={[0.05, 0.08, 1.6, 8]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
      ))}
      {/* Main tube - pointing toward window */}
      <group position={[0, 1.5, 0]} rotation={[Math.PI / 5, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.14, 2.2, 16]} />
          <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Lens cap area */}
        <mesh castShadow position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#aa9977" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Eyepiece */}
        <mesh castShadow position={[0, -1, 0.12]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.25, 8]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {/* Brass fittings */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.19, 0.025, 8, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

interface BeaconDeskProps {
  position: [number, number, number]
}

function BeaconDesk({ position }: BeaconDeskProps) {
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)

  const handleClick = () => {
    if (activeInfoPoint !== 'beacon') {
      setActiveInfoPoint('beacon')
    }
  }

  return (
    <group position={position}>
      {/* Spotlight on beacon - SECONDARY focus */}
      <pointLight
        position={[0, 2.5, 0]}
        color="#ff9944"
        intensity={4}
        distance={5}
        decay={2}
      />

      {/* Clickable area for beacon desk */}
      <mesh
        position={[0, 1, 0]}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <boxGeometry args={[1.5, 2.5, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Control desk base */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.8]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Desk top surface */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[1.3, 0.1, 0.9]} />
        <meshStandardMaterial color="#3a3a40" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Signal beacon pole */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Signal beacon light housing */}
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Beacon light (amber/warning) */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ff6600"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight
        position={[0, 2, 0]}
        color="#ff8800"
        intensity={5}
        distance={4}
        decay={2}
      />

      {/* Control panel indicators */}
      {[[-0.3, 0.92, 0.2], [0, 0.92, 0.2], [0.3, 0.92, 0.2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <circleGeometry args={[0.05, 8]} />
          <meshStandardMaterial
            color={['#00ff00', '#ffaa00', '#ff4444'][i]}
            emissive={['#00ff00', '#ffaa00', '#ff4444'][i]}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

interface LedgerProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function Ledger({ position, rotation = [0, 0, 0] }: LedgerProps) {
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)

  const handleClick = () => {
    if (activeInfoPoint !== 'ledger') {
      setActiveInfoPoint('ledger')
    }
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Clickable area for ledger */}
      <mesh
        position={[0, 0, 0.1]}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[2, 1.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Subtle spotlight on ledger - TERTIARY focus */}
      <pointLight
        position={[0.5, 0.5, 0]}
        color="#aaaaaa"
        intensity={2}
        distance={3}
        decay={2}
      />

      {/* Main board backing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.2, 0.08]} />
        <meshStandardMaterial color="#3a3020" />
      </mesh>

      {/* Board frame */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.9, 1.3, 0.04]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>

      {/* Inner content area (parchment/paper look) */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.6, 1]} />
        <meshStandardMaterial color="#d4c8a0" />
      </mesh>

      {/* Journal lines (simplified representation) */}
      {[-0.3, -0.1, 0.1, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <planeGeometry args={[1.4, 0.02]} />
          <meshStandardMaterial color="#8a7a60" />
        </mesh>
      ))}

      {/* Binding rings on left side */}
      {[-0.35, 0, 0.35].map((y, i) => (
        <mesh key={i} position={[-0.85, y, 0.05]}>
          <torusGeometry args={[0.04, 0.01, 6, 12]} />
          <meshStandardMaterial color="#8b7355" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
