const ROOM_RADIUS = 6
const WALL_HEIGHT = 8
const WALL_THICKNESS = 0.4

export default function Watchtower() {
  return (
    <group position={[0, 0, -30]}>
      {/* Cool moonlight/starlight ambiance */}
      <pointLight
        position={[0, 6, 0]}
        color="#aaccff"
        intensity={10}
        distance={20}
        decay={2}
      />
      <pointLight
        position={[0, 3, 0]}
        color="#88aadd"
        intensity={5}
        distance={12}
        decay={2}
      />
      {/* Window light coming in */}
      <pointLight
        position={[0, 5, -4]}
        color="#ffffff"
        intensity={8}
        distance={10}
        decay={2}
      />

      {/* Floor - circular stone */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[ROOM_RADIUS, 24]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>

      {/* Ceiling - domed */}
      <mesh position={[0, WALL_HEIGHT + 1, 0]}>
        <sphereGeometry args={[ROOM_RADIUS, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a2a30" side={1} />
      </mesh>

      {/* Circular wall with windows */}
      <CircularWall />

      {/* Doorway to Central Hall (south side) */}
      <Doorway position={[0, 0, ROOM_RADIUS - 0.2]} />

      {/* Central telescope on rotating platform */}
      <Telescope position={[0, 0, -1]} />

      {/* Map table */}
      <MapTable position={[-3, 0, 2]} />

      {/* Star charts on walls */}
      <StarChart position={[4.5, 3, -3]} rotation={[0, -Math.PI / 4, 0]} />
      <StarChart position={[-4.5, 3, -3]} rotation={[0, Math.PI / 4, 0]} />

      {/* Observation instruments */}
      <Astrolabe position={[3.5, 1.2, 1]} />
      <Compass position={[-3.5, 1.2, 1]} />

      {/* Bookshelves with astronomy books */}
      <CurvedBookshelf position={[-4, 0, -1]} rotation={[0, Math.PI / 6, 0]} />
      <CurvedBookshelf position={[4, 0, -1]} rotation={[0, -Math.PI / 6, 0]} />

      {/* Signal lanterns */}
      <SignalLantern position={[-2, 2.5, -5]} color="#ff8800" />
      <SignalLantern position={[2, 2.5, -5]} color="#00ff88" />

      {/* Hour glass */}
      <HourGlass position={[2, 1, 3]} />
    </group>
  )
}

function CircularWall() {
  const segments = 16
  const windowSegments = [2, 6, 10, 14] // Which segments have windows

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
                <meshStandardMaterial color="#4a4a50" />
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
  const windowWidth = 1.2
  const windowHeight = 2.5
  const windowBottom = 3

  return (
    <group position={position} rotation={rotation}>
      {/* Bottom section */}
      <mesh castShadow receiveShadow position={[0, windowBottom / 2, 0]}>
        <boxGeometry args={[2.4, windowBottom, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Left section */}
      <mesh castShadow receiveShadow position={[-(windowWidth / 2 + 0.4), windowBottom + windowHeight / 2, 0]}>
        <boxGeometry args={[0.8, windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Right section */}
      <mesh castShadow receiveShadow position={[(windowWidth / 2 + 0.4), windowBottom + windowHeight / 2, 0]}>
        <boxGeometry args={[0.8, windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Top section */}
      <mesh castShadow receiveShadow position={[0, windowBottom + windowHeight + (WALL_HEIGHT - windowBottom - windowHeight) / 2, 0]}>
        <boxGeometry args={[2.4, WALL_HEIGHT - windowBottom - windowHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Window arch */}
      <mesh position={[0, windowBottom + windowHeight - 0.3, 0]}>
        <torusGeometry args={[windowWidth / 2, 0.1, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#5a5a60" />
      </mesh>
      {/* Window "glass" - night sky */}
      <mesh position={[0, windowBottom + windowHeight / 2, 0.1]}>
        <planeGeometry args={[windowWidth, windowHeight]} />
        <meshStandardMaterial
          color="#0a0a20"
          emissive="#1a1a40"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Stars in window */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * windowWidth * 0.8,
            windowBottom + 0.5 + Math.random() * (windowHeight - 1),
            0.12,
          ]}
        >
          <circleGeometry args={[0.02 + Math.random() * 0.02, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
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
  const doorWidth = 2
  const doorHeight = 3

  return (
    <group position={position}>
      {/* Top arch */}
      <mesh castShadow position={[0, doorHeight + 0.5, 0]}>
        <boxGeometry args={[doorWidth + 0.4, WALL_HEIGHT - doorHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
    </group>
  )
}

interface TelescopeProps {
  position: [number, number, number]
}

function Telescope({ position }: TelescopeProps) {
  return (
    <group position={position}>
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
      {/* Main tube */}
      <group position={[0, 1.5, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.12, 2, 16]} />
          <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Lens cap area */}
        <mesh castShadow position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.18, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#aa9977" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Eyepiece */}
        <mesh castShadow position={[0, -0.9, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {/* Brass fittings */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.16, 0.02, 8, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

interface MapTableProps {
  position: [number, number, number]
}

function MapTable({ position }: MapTableProps) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.08, 16]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Central pedestal */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.8, 8]} />
        <meshStandardMaterial color="#4a3520" />
      </mesh>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />
        <meshStandardMaterial color="#4a3520" />
      </mesh>
      {/* Map on table */}
      <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
        <planeGeometry args={[1.8, 1.4]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>
      {/* Map details (simple colored regions) */}
      <mesh position={[-0.2, 0.91, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 8]} />
        <meshStandardMaterial color="#4a7a4a" />
      </mesh>
      <mesh position={[0.3, 0.91, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 8]} />
        <meshStandardMaterial color="#6a8aaa" />
      </mesh>
      {/* Compass rose on map */}
      <mesh position={[0.5, 0.91, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

interface StarChartProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function StarChart({ position, rotation = [0, 0, 0] }: StarChartProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chart backing */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.5, 0.05]} />
        <meshStandardMaterial color="#2a2a30" />
      </mesh>
      {/* Chart surface */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial color="#1a1a30" />
      </mesh>
      {/* Constellation lines */}
      {[
        [-0.3, 0.2],
        [-0.1, 0.4],
        [0.2, 0.3],
        [0.4, 0.1],
        [0.3, -0.2],
        [-0.2, -0.3],
        [-0.5, 0],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.035]}>
          <circleGeometry args={[0.03, 8]} />
          <meshStandardMaterial
            color="#ffff88"
            emissive="#ffff44"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      {/* Frame */}
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.95, 1, 4]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
    </group>
  )
}

interface AstrolabeProps {
  position: [number, number, number]
}

function Astrolabe({ position }: AstrolabeProps) {
  return (
    <group position={position}>
      {/* Stand */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Main disk */}
      <mesh castShadow position={[0, 0.7, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner rings */}
      <mesh position={[0, 0.72, 0.05]} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[0.18, 0.01, 8, 24]} />
        <meshStandardMaterial color="#daa520" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.73, 0.08]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[0.12, 0.01, 8, 24]} />
        <meshStandardMaterial color="#daa520" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

interface CompassProps {
  position: [number, number, number]
}

function Compass({ position }: CompassProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Compass body */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glass dome */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#aaccff" transparent opacity={0.3} />
      </mesh>
      {/* Needle */}
      <mesh position={[0, 0.19, 0]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[0.18, 0.01, 0.02]} />
        <meshStandardMaterial color="#ff4444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

interface CurvedBookshelfProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function CurvedBookshelf({ position, rotation = [0, 0, 0] }: CurvedBookshelfProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Back panel */}
      <mesh castShadow receiveShadow position={[0, 1.5, -0.2]}>
        <boxGeometry args={[1.5, 3, 0.1]} />
        <meshStandardMaterial color="#4a3520" />
      </mesh>
      {/* Shelves */}
      {[0.1, 0.9, 1.7, 2.5].map((y, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[1.5, 0.08, 0.4]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
      ))}
      {/* Books */}
      {[0, 1, 2].map((shelf) => (
        <group key={shelf} position={[0, 0.5 + shelf * 0.8, 0.05]}>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} castShadow position={[-0.5 + i * 0.25, 0, 0]}>
              <boxGeometry args={[0.12, 0.5 + Math.random() * 0.15, 0.25]} />
              <meshStandardMaterial
                color={['#2a4a6a', '#4a2a2a', '#2a4a2a', '#4a4a2a', '#3a2a4a'][i]}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

interface SignalLanternProps {
  position: [number, number, number]
  color: string
}

function SignalLantern({ position, color }: SignalLanternProps) {
  return (
    <group position={position}>
      {/* Bracket */}
      <mesh castShadow position={[0, 0.3, 0.2]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Lantern body */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Light */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} color={color} intensity={3} distance={5} decay={2} />
    </group>
  )
}

interface HourGlassProps {
  position: [number, number, number]
}

function HourGlass({ position }: HourGlassProps) {
  return (
    <group position={position}>
      {/* Frame top */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      {/* Frame bottom */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      {/* Glass bulbs */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.4} />
      </mesh>
      {/* Sand (bottom) */}
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.06, 0.08, 12]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      {/* Vertical supports */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.sin(angle) * 0.1, 0.2, Math.cos(angle) * 0.1]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
      ))}
    </group>
  )
}
