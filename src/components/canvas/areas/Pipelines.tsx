const CORRIDOR_WIDTH = 6
const CORRIDOR_LENGTH = 20
const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.4

export default function Pipelines() {
  return (
    <group position={[0, 0, 30]}>
      {/* Cool blue-green industrial lighting */}
      <pointLight
        position={[0, 3, 0]}
        color="#00aaff"
        intensity={8}
        distance={15}
        decay={2}
      />
      <pointLight
        position={[0, 3, -6]}
        color="#00ff88"
        intensity={6}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, 3, 6]}
        color="#00aaff"
        intensity={6}
        distance={12}
        decay={2}
      />

      {/* Floor - wet stone */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#2a3a3a" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Ceiling - stone with pipes */}
      <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#1a2a2a" />
      </mesh>

      {/* Walls */}
      {/* West wall */}
      <Wall
        position={[-CORRIDOR_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, CORRIDOR_LENGTH]}
      />
      {/* East wall */}
      <Wall
        position={[CORRIDOR_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, CORRIDOR_LENGTH]}
      />
      {/* North wall - with doorway to Central Hall */}
      <WallWithDoorway
        position={[0, 0, -CORRIDOR_LENGTH / 2]}
        wallHeight={WALL_HEIGHT}
        wallWidth={CORRIDOR_WIDTH}
        doorWidth={2.5}
        doorHeight={3}
        orientation="horizontal"
      />
      {/* South wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, CORRIDOR_LENGTH / 2]}
        size={[CORRIDOR_WIDTH, WALL_HEIGHT, WALL_THICKNESS]}
      />

      {/* Main water channel running down the center */}
      <WaterChannel position={[0, 0, 0]} length={CORRIDOR_LENGTH - 4} />

      {/* Pipes along the walls */}
      <PipeSystem position={[-2.5, 2.5, 0]} side="left" />
      <PipeSystem position={[2.5, 2.5, 0]} side="right" />

      {/* Control panels */}
      <ControlPanel position={[-2.2, 1.2, -4]} rotation={[0, Math.PI / 2, 0]} />
      <ControlPanel position={[2.2, 1.2, 2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Valve wheels */}
      <ValveWheel position={[-2.5, 1.5, 4]} />
      <ValveWheel position={[2.5, 1.5, -2]} />

      {/* Grates in floor */}
      <FloorGrate position={[0, 0.01, -6]} />
      <FloorGrate position={[0, 0.01, 6]} />

      {/* Support pillars */}
      <SupportPillar position={[-2, 0, 0]} />
      <SupportPillar position={[2, 0, 0]} />
    </group>
  )
}

interface WallProps {
  position: [number, number, number]
  size: [number, number, number]
}

function Wall({ position, size }: WallProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#3a4a4a" roughness={0.95} />
    </mesh>
  )
}

interface WallWithDoorwayProps {
  position: [number, number, number]
  wallHeight: number
  wallWidth: number
  doorWidth: number
  doorHeight: number
  orientation: 'horizontal' | 'vertical'
}

function WallWithDoorway({
  position,
  wallHeight,
  wallWidth,
  doorWidth,
  doorHeight,
  orientation,
}: WallWithDoorwayProps) {
  const sideWidth = (wallWidth - doorWidth) / 2
  const topHeight = wallHeight - doorHeight
  const isHorizontal = orientation === 'horizontal'

  return (
    <group position={position}>
      {/* Left section */}
      <mesh
        castShadow
        receiveShadow
        position={isHorizontal ? [-wallWidth / 2 + sideWidth / 2, wallHeight / 2, 0] : [0, wallHeight / 2, -wallWidth / 2 + sideWidth / 2]}
      >
        <boxGeometry args={isHorizontal ? [sideWidth, wallHeight, WALL_THICKNESS] : [WALL_THICKNESS, wallHeight, sideWidth]} />
        <meshStandardMaterial color="#3a4a4a" roughness={0.95} />
      </mesh>
      {/* Right section */}
      <mesh
        castShadow
        receiveShadow
        position={isHorizontal ? [wallWidth / 2 - sideWidth / 2, wallHeight / 2, 0] : [0, wallHeight / 2, wallWidth / 2 - sideWidth / 2]}
      >
        <boxGeometry args={isHorizontal ? [sideWidth, wallHeight, WALL_THICKNESS] : [WALL_THICKNESS, wallHeight, sideWidth]} />
        <meshStandardMaterial color="#3a4a4a" roughness={0.95} />
      </mesh>
      {/* Top section above door */}
      <mesh castShadow receiveShadow position={[0, doorHeight + topHeight / 2, 0]}>
        <boxGeometry args={isHorizontal ? [doorWidth, topHeight, WALL_THICKNESS] : [WALL_THICKNESS, topHeight, doorWidth]} />
        <meshStandardMaterial color="#3a4a4a" roughness={0.95} />
      </mesh>
    </group>
  )
}

interface WaterChannelProps {
  position: [number, number, number]
  length: number
}

function WaterChannel({ position, length }: WaterChannelProps) {
  return (
    <group position={position}>
      {/* Channel depression */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.2, 0.3, length]} />
        <meshStandardMaterial color="#1a2a2a" />
      </mesh>
      {/* Water surface */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, length - 0.5]} />
        <meshStandardMaterial
          color="#004466"
          metalness={0.4}
          roughness={0.1}
          transparent
          opacity={0.7}
          emissive="#003344"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Glowing strips along channel */}
      <mesh position={[-0.55, 0.01, 0]}>
        <boxGeometry args={[0.05, 0.02, length]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.55, 0.01, 0]}>
        <boxGeometry args={[0.05, 0.02, length]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

interface PipeSystemProps {
  position: [number, number, number]
  side: 'left' | 'right'
}

function PipeSystem({ position, side }: PipeSystemProps) {
  const xOffset = side === 'left' ? 0.3 : -0.3

  return (
    <group position={position}>
      {/* Main horizontal pipe */}
      <mesh castShadow position={[xOffset, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 18, 12]} />
        <meshStandardMaterial color="#4a5a5a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Secondary pipe */}
      <mesh castShadow position={[xOffset, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 18, 12]} />
        <meshStandardMaterial color="#5a6a6a" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Vertical connectors */}
      {[-6, 0, 6].map((z, i) => (
        <mesh key={i} castShadow position={[xOffset, -0.8, z]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#4a5a5a" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* Glowing status lights */}
      {[-7, -3, 1, 5].map((z, i) => (
        <mesh key={i} position={[xOffset * 0.5, 0.2, z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00ff00' : '#00aaff'}
            emissive={i % 2 === 0 ? '#00ff00' : '#00aaff'}
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  )
}

interface ControlPanelProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function ControlPanel({ position, rotation = [0, 0, 0] }: ControlPanelProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Panel body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 0.15]} />
        <meshStandardMaterial color="#3a4a4a" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.2, 0.08]}>
        <boxGeometry args={[0.5, 0.35, 0.02]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#003366"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Buttons */}
      {[
        [-0.2, -0.2],
        [0, -0.2],
        [0.2, -0.2],
        [-0.2, -0.35],
        [0, -0.35],
        [0.2, -0.35],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.08]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
          <meshStandardMaterial
            color={['#ff0000', '#00ff00', '#ffff00', '#0088ff', '#ff8800', '#00ffff'][i]}
            emissive={['#ff0000', '#00ff00', '#ffff00', '#0088ff', '#ff8800', '#00ffff'][i]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

interface ValveWheelProps {
  position: [number, number, number]
}

function ValveWheel({ position }: ValveWheelProps) {
  return (
    <group position={position}>
      {/* Valve body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Wheel */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16]} />
        <meshStandardMaterial color="#aa3333" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Spokes */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, angle]} position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
          <meshStandardMaterial color="#aa3333" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

interface FloorGrateProps {
  position: [number, number, number]
}

function FloorGrate({ position }: FloorGrateProps) {
  return (
    <group position={position}>
      {/* Grate frame */}
      <mesh receiveShadow>
        <boxGeometry args={[1.5, 0.05, 1.5]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Grate bars */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.06, 1.4]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

interface SupportPillarProps {
  position: [number, number, number]
}

function SupportPillar({ position }: SupportPillarProps) {
  return (
    <group position={position}>
      {/* Pillar */}
      <mesh castShadow receiveShadow position={[0, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.4, WALL_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#4a5a5a" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial color="#3a4a4a" />
      </mesh>
    </group>
  )
}
