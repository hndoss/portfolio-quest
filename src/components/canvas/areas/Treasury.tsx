const ROOM_WIDTH = 12
const ROOM_DEPTH = 14
const WALL_HEIGHT = 5
const WALL_THICKNESS = 0.5

export default function Treasury() {
  return (
    <group position={[0, 0, 55]}>
      {/* Rich golden ambient lighting */}
      <pointLight
        position={[0, 4, 0]}
        color="#ffd700"
        intensity={12}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[-3, 2.5, -3]}
        color="#ffaa00"
        intensity={6}
        distance={10}
        decay={2}
      />
      <pointLight
        position={[3, 2.5, 3]}
        color="#ffcc44"
        intensity={6}
        distance={10}
        decay={2}
      />

      {/* Floor - polished stone with gold inlays */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Ceiling - vaulted appearance */}
      <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1a20" />
      </mesh>

      {/* Walls - thick vault walls */}
      {/* North wall - with doorway from Pipelines */}
      <WallWithDoorway
        position={[0, 0, -ROOM_DEPTH / 2]}
        wallHeight={WALL_HEIGHT}
        wallWidth={ROOM_WIDTH}
        doorWidth={2}
        doorHeight={2.8}
      />
      {/* South wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, ROOM_DEPTH / 2]}
        size={[ROOM_WIDTH, WALL_HEIGHT, WALL_THICKNESS]}
      />
      {/* East wall */}
      <Wall
        position={[ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH]}
      />
      {/* West wall */}
      <Wall
        position={[-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH]}
      />

      {/* Main vault door (decorative, on south wall) */}
      <VaultDoor position={[0, 0, 6.5]} />

      {/* Treasure chests */}
      <TreasureChest position={[-4, 0, 3]} rotation={[0, Math.PI / 6, 0]} open={false} />
      <TreasureChest position={[4, 0, 3]} rotation={[0, -Math.PI / 6, 0]} open={true} />
      <TreasureChest position={[-3, 0, -3]} rotation={[0, Math.PI / 4, 0]} open={false} />

      {/* Gold piles */}
      <GoldPile position={[3.5, 0, -4]} size="large" />
      <GoldPile position={[-2, 0, 0]} size="small" />
      <GoldPile position={[0, 0, 4]} size="medium" />

      {/* Safe deposit boxes on walls */}
      <SafeBoxWall position={[-5.7, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
      <SafeBoxWall position={[5.7, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Security pedestals with gems */}
      <GemPedestal position={[-2, 0, -5]} gemColor="#ff0044" />
      <GemPedestal position={[2, 0, -5]} gemColor="#00ff88" />
      <GemPedestal position={[0, 0, -4]} gemColor="#4488ff" />

      {/* Decorative columns */}
      <Column position={[-4, 0, -5]} />
      <Column position={[4, 0, -5]} />
      <Column position={[-4, 0, 5]} />
      <Column position={[4, 0, 5]} />
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
      <meshStandardMaterial color="#3a3a40" roughness={0.8} />
    </mesh>
  )
}

interface WallWithDoorwayProps {
  position: [number, number, number]
  wallHeight: number
  wallWidth: number
  doorWidth: number
  doorHeight: number
}

function WallWithDoorway({
  position,
  wallHeight,
  wallWidth,
  doorWidth,
  doorHeight,
}: WallWithDoorwayProps) {
  const sideWidth = (wallWidth - doorWidth) / 2
  const topHeight = wallHeight - doorHeight

  return (
    <group position={position}>
      {/* Left section */}
      <mesh castShadow receiveShadow position={[-wallWidth / 2 + sideWidth / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[sideWidth, wallHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.8} />
      </mesh>
      {/* Right section */}
      <mesh castShadow receiveShadow position={[wallWidth / 2 - sideWidth / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[sideWidth, wallHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.8} />
      </mesh>
      {/* Top section above door */}
      <mesh castShadow receiveShadow position={[0, doorHeight + topHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, topHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.8} />
      </mesh>
    </group>
  )
}

interface VaultDoorProps {
  position: [number, number, number]
}

function VaultDoor({ position }: VaultDoorProps) {
  return (
    <group position={position}>
      {/* Door frame */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[3.5, 3.6, 0.3]} />
        <meshStandardMaterial color="#4a4a50" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Door surface */}
      <mesh castShadow position={[0, 1.8, 0.2]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        <meshStandardMaterial color="#5a5a60" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Door handle/wheel */}
      <mesh position={[0, 1.8, 0.35]}>
        <torusGeometry args={[0.5, 0.05, 8, 24]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Spokes */}
      {[0, Math.PI / 3, Math.PI * 2 / 3, Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3].map((angle, i) => (
        <mesh key={i} position={[0, 1.8, 0.35]} rotation={[0, 0, angle]}>
          <boxGeometry args={[1, 0.04, 0.04]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Locking bolts */}
      {[
        [1.2, 2.8],
        [-1.2, 2.8],
        [1.2, 0.8],
        [-1.2, 0.8],
      ].map(([x, y], i) => (
        <mesh key={i} castShadow position={[x, y, 0.25]}>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

interface TreasureChestProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  open: boolean
}

function TreasureChest({ position, rotation = [0, 0, 0], open }: TreasureChestProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chest body */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1, 0.7, 0.7]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.8} />
      </mesh>
      {/* Chest lid */}
      <group position={[0, 0.7, -0.35]} rotation={[open ? -Math.PI / 3 : 0, 0, 0]}>
        <mesh castShadow position={[0, 0.15, 0.35]}>
          <boxGeometry args={[1, 0.3, 0.7]} />
          <meshStandardMaterial color="#5a3a20" roughness={0.8} />
        </mesh>
        {/* Lid curve */}
        <mesh castShadow position={[0, 0.35, 0.35]}>
          <cylinderGeometry args={[0.35, 0.35, 1, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#5a3a20" roughness={0.8} />
        </mesh>
      </group>
      {/* Metal bands */}
      {[-0.35, 0, 0.35].map((z, i) => (
        <mesh key={i} castShadow position={[0, 0.35, z * 0.8]}>
          <boxGeometry args={[1.05, 0.08, 0.08]} />
          <meshStandardMaterial color="#8b7355" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* Lock */}
      <mesh castShadow position={[0, 0.5, 0.36]}>
        <boxGeometry args={[0.15, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Gold inside (if open) */}
      {open && (
        <group position={[0, 0.5, 0]}>
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.6,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.4,
              ]}
            >
              <cylinderGeometry args={[0.06, 0.06, 0.03, 12]} />
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

interface GoldPileProps {
  position: [number, number, number]
  size: 'small' | 'medium' | 'large'
}

function GoldPile({ position, size }: GoldPileProps) {
  const counts = { small: 5, medium: 12, large: 20 }
  const spreads = { small: 0.3, medium: 0.5, large: 0.8 }
  const count = counts[size]
  const spread = spreads[size]

  return (
    <group position={position}>
      {[...Array(count)].map((_, i) => (
        <mesh
          key={i}
          castShadow
          position={[
            (Math.random() - 0.5) * spread * 2,
            i * 0.025 + 0.015,
            (Math.random() - 0.5) * spread * 2,
          ]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.025, 12]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
      {/* A few gems mixed in */}
      {size !== 'small' && (
        <>
          <mesh castShadow position={[0.1, 0.15, 0.05]}>
            <octahedronGeometry args={[0.06]} />
            <meshStandardMaterial color="#ff4466" metalness={0.3} roughness={0.1} />
          </mesh>
          <mesh castShadow position={[-0.15, 0.12, -0.08]}>
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial color="#44ff88" metalness={0.3} roughness={0.1} />
          </mesh>
        </>
      )}
    </group>
  )
}

interface SafeBoxWallProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function SafeBoxWall({ position, rotation = [0, 0, 0] }: SafeBoxWallProps) {
  const rows = 4
  const cols = 6

  return (
    <group position={position} rotation={rotation}>
      {/* Background panel */}
      <mesh receiveShadow position={[0, 0, -0.1]}>
        <boxGeometry args={[cols * 0.45 + 0.2, rows * 0.35 + 0.2, 0.1]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Safe boxes */}
      {[...Array(rows)].map((_, row) =>
        [...Array(cols)].map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            castShadow
            position={[
              (col - (cols - 1) / 2) * 0.45,
              (row - (rows - 1) / 2) * 0.35,
              0,
            ]}
          >
            <boxGeometry args={[0.4, 0.3, 0.15]} />
            <meshStandardMaterial color="#4a4a55" metalness={0.7} roughness={0.4} />
          </mesh>
        ))
      )}
      {/* Keyholes */}
      {[...Array(rows)].map((_, row) =>
        [...Array(cols)].map((_, col) => (
          <mesh
            key={`keyhole-${row}-${col}`}
            position={[
              (col - (cols - 1) / 2) * 0.45,
              (row - (rows - 1) / 2) * 0.35 - 0.05,
              0.08,
            ]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
        ))
      )}
    </group>
  )
}

interface GemPedestalProps {
  position: [number, number, number]
  gemColor: string
}

function GemPedestal({ position, gemColor }: GemPedestalProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Column */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Top platform */}
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.1, 8]} />
        <meshStandardMaterial color="#5a5a60" />
      </mesh>
      {/* Gem */}
      <mesh castShadow position={[0, 1.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial
          color={gemColor}
          emissive={gemColor}
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Gem glow */}
      <pointLight position={[0, 1.35, 0]} color={gemColor} intensity={2} distance={3} decay={2} />
    </group>
  )
}

interface ColumnProps {
  position: [number, number, number]
}

function Column({ position }: ColumnProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Shaft */}
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 4.2, 12]} />
        <meshStandardMaterial color="#5a5a60" />
      </mesh>
      {/* Capital */}
      <mesh castShadow receiveShadow position={[0, 4.7, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      {/* Gold accent ring */}
      <mesh position={[0, 2, 0]}>
        <torusGeometry args={[0.28, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
