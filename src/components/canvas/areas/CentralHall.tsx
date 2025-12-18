const ROOM_SIZE = 20
const WALL_HEIGHT = 6
const WALL_THICKNESS = 0.5

export default function CentralHall() {
  return (
    <group>
      {/* Warm welcoming lighting */}
      <pointLight
        position={[0, 5, 0]}
        color="#ffe4c4"
        intensity={15}
        distance={25}
        decay={2}
      />
      <pointLight
        position={[-6, 3, 0]}
        color="#ffd700"
        intensity={5}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[6, 3, 0]}
        color="#ff8c00"
        intensity={5}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, 3, -6]}
        color="#87ceeb"
        intensity={5}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, 3, 6]}
        color="#00ff88"
        intensity={5}
        distance={12}
        decay={2}
      />

      {/* Floor - polished stone with pattern */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Floor decoration - compass rose pattern */}
      <FloorCompass position={[0, 0.01, 0]} />

      {/* Ceiling */}
      <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Walls with doorways */}
      {/* North wall - doorway to Watchtower */}
      <WallWithDoorway
        position={[0, 0, -ROOM_SIZE / 2]}
        wallWidth={ROOM_SIZE}
        wallHeight={WALL_HEIGHT}
        doorWidth={3}
        doorHeight={4}
        orientation="horizontal"
      />
      {/* South wall - doorway to Pipelines */}
      <WallWithDoorway
        position={[0, 0, ROOM_SIZE / 2]}
        wallWidth={ROOM_SIZE}
        wallHeight={WALL_HEIGHT}
        doorWidth={3}
        doorHeight={4}
        orientation="horizontal"
      />
      {/* East wall - doorway to Forge */}
      <WallWithDoorway
        position={[ROOM_SIZE / 2, 0, 0]}
        wallWidth={ROOM_SIZE}
        wallHeight={WALL_HEIGHT}
        doorWidth={3}
        doorHeight={4}
        orientation="vertical"
      />
      {/* West wall - doorway to Library */}
      <WallWithDoorway
        position={[-ROOM_SIZE / 2, 0, 0]}
        wallWidth={ROOM_SIZE}
        wallHeight={WALL_HEIGHT}
        doorWidth={3}
        doorHeight={4}
        orientation="vertical"
      />

      {/* Central pedestal with profile display */}
      <ProfilePedestal position={[0, 0, 0]} />

      {/* Direction banners near each doorway */}
      <AreaBanner
        position={[-7, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        color="#ffa54f"
        label="Library"
        icon="book"
      />
      <AreaBanner
        position={[7, 3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#ff4500"
        label="Forge"
        icon="anvil"
      />
      <AreaBanner
        position={[0, 3, -7]}
        rotation={[0, 0, 0]}
        color="#87ceeb"
        label="Watchtower"
        icon="telescope"
      />
      <AreaBanner
        position={[0, 3, 7]}
        rotation={[0, Math.PI, 0]}
        color="#00ff88"
        label="Pipelines"
        icon="pipe"
      />

      {/* Decorative corner pillars */}
      <CornerPillar position={[-8, 0, -8]} />
      <CornerPillar position={[8, 0, -8]} />
      <CornerPillar position={[-8, 0, 8]} />
      <CornerPillar position={[8, 0, 8]} />

      {/* Wall sconces for lighting atmosphere */}
      <WallSconce position={[-9.5, 3, -4]} rotation={[0, Math.PI / 2, 0]} />
      <WallSconce position={[-9.5, 3, 4]} rotation={[0, Math.PI / 2, 0]} />
      <WallSconce position={[9.5, 3, -4]} rotation={[0, -Math.PI / 2, 0]} />
      <WallSconce position={[9.5, 3, 4]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
}

interface WallWithDoorwayProps {
  position: [number, number, number]
  wallWidth: number
  wallHeight: number
  doorWidth: number
  doorHeight: number
  orientation: 'horizontal' | 'vertical'
}

function WallWithDoorway({
  position,
  wallWidth,
  wallHeight,
  doorWidth,
  doorHeight,
  orientation,
}: WallWithDoorwayProps) {
  const sideWidth = (wallWidth - doorWidth) / 2
  const topHeight = wallHeight - doorHeight
  const isHorizontal = orientation === 'horizontal'

  return (
    <group position={position}>
      {/* Left/Front section */}
      <mesh
        castShadow
        receiveShadow
        position={
          isHorizontal
            ? [-wallWidth / 2 + sideWidth / 2, wallHeight / 2, 0]
            : [0, wallHeight / 2, -wallWidth / 2 + sideWidth / 2]
        }
      >
        <boxGeometry
          args={
            isHorizontal
              ? [sideWidth, wallHeight, WALL_THICKNESS]
              : [WALL_THICKNESS, wallHeight, sideWidth]
          }
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Right/Back section */}
      <mesh
        castShadow
        receiveShadow
        position={
          isHorizontal
            ? [wallWidth / 2 - sideWidth / 2, wallHeight / 2, 0]
            : [0, wallHeight / 2, wallWidth / 2 - sideWidth / 2]
        }
      >
        <boxGeometry
          args={
            isHorizontal
              ? [sideWidth, wallHeight, WALL_THICKNESS]
              : [WALL_THICKNESS, wallHeight, sideWidth]
          }
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Top section above door */}
      <mesh castShadow receiveShadow position={[0, doorHeight + topHeight / 2, 0]}>
        <boxGeometry
          args={
            isHorizontal
              ? [doorWidth, topHeight, WALL_THICKNESS]
              : [WALL_THICKNESS, topHeight, doorWidth]
          }
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, doorHeight / 2, isHorizontal ? 0.05 : 0]} rotation={isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
        <boxGeometry args={[doorWidth + 0.3, doorHeight + 0.2, 0.15]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
    </group>
  )
}

interface ProfilePedestalProps {
  position: [number, number, number]
}

function ProfilePedestal({ position }: ProfilePedestalProps) {
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Main pedestal */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1.2, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Top platform */}
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.8, 0.6, 0.2, 8]} />
        <meshStandardMaterial color="#6a6a6a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Glowing crystal/orb on top */}
      <mesh position={[0, 2.1, 0]}>
        <dodecahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Glow light */}
      <pointLight position={[0, 2.1, 0]} color="#00ff88" intensity={3} distance={5} decay={2} />
      {/* Decorative rings */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.75, 0.03, 8, 24]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.65, 0.03, 8, 24]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

interface FloorCompassProps {
  position: [number, number, number]
}

function FloorCompass({ position }: FloorCompassProps) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[3.5, 4, 32]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Inner ring */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[2, 2.5, 32]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Cardinal direction markers */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 3, Math.cos(angle) * 3, 0.002]}
          rotation={[0, 0, -angle]}
        >
          <coneGeometry args={[0.3, 0.8, 3]} />
          <meshStandardMaterial
            color={['#87ceeb', '#ff4500', '#00ff88', '#ffa54f'][i]}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

interface AreaBannerProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  label: string
  icon: string
}

function AreaBanner({ position, rotation, color }: AreaBannerProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Banner pole */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 8]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Banner fabric */}
      <mesh castShadow position={[0, 0, 0.15]}>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Banner border */}
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[1.4, 1.9, 0.02]} />
        <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Center emblem glow */}
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Small light for banner */}
      <pointLight position={[0, 0, 0.5]} color={color} intensity={1} distance={3} decay={2} />
    </group>
  )
}

interface CornerPillarProps {
  position: [number, number, number]
}

function CornerPillar({ position }: CornerPillarProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Shaft */}
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 5, 8]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>
      {/* Capital */}
      <mesh castShadow receiveShadow position={[0, 5.65, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Gold ring accent */}
      <mesh position={[0, 2, 0]}>
        <torusGeometry args={[0.38, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

interface WallSconceProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

function WallSconce({ position, rotation }: WallSconceProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bracket */}
      <mesh castShadow position={[0, 0, 0.15]}>
        <boxGeometry args={[0.15, 0.4, 0.3]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Torch holder */}
      <mesh castShadow position={[0, 0.1, 0.35]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Flame glow */}
      <mesh position={[0, 0.35, 0.35]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Light source */}
      <pointLight
        position={[0, 0.35, 0.35]}
        color="#ff6600"
        intensity={2}
        distance={6}
        decay={2}
      />
    </group>
  )
}
