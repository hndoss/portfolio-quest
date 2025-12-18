const ROOM_WIDTH = 14
const ROOM_DEPTH = 16
const WALL_HEIGHT = 5
const WALL_THICKNESS = 0.3

export default function Forge() {
  return (
    <group position={[25, 0, 0]}>
      {/* Warm forge lighting - orange/red glow */}
      <pointLight
        position={[0, 3, -4]}
        color="#ff4500"
        intensity={20}
        distance={15}
        decay={2}
      />
      <pointLight
        position={[-4, 2, 0]}
        color="#ff6600"
        intensity={10}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[4, 2, 2]}
        color="#ff8c00"
        intensity={8}
        distance={10}
        decay={2}
      />

      {/* Floor - dark stone with metal inlays */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Ceiling - high with smoke stains */}
      <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Walls */}
      {/* Back wall (east) */}
      <Wall
        position={[ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH]}
      />
      {/* Front wall (west) - with doorway */}
      <WallWithDoorway
        position={[-ROOM_WIDTH / 2, 0, 0]}
        wallHeight={WALL_HEIGHT}
        wallDepth={ROOM_DEPTH}
        doorWidth={2.5}
        doorHeight={3}
      />
      {/* North wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2]}
        size={[ROOM_WIDTH, WALL_HEIGHT, WALL_THICKNESS]}
      />
      {/* South wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, ROOM_DEPTH / 2]}
        size={[ROOM_WIDTH, WALL_HEIGHT, WALL_THICKNESS]}
      />

      {/* Main Forge/Furnace */}
      <Furnace position={[0, 0, -5]} />

      {/* Anvil workstation */}
      <Anvil position={[-3, 0, 0]} />
      <Anvil position={[3, 0, 2]} rotation={[0, Math.PI / 4, 0]} />

      {/* Tool rack on wall */}
      <ToolRack position={[6, 1.5, -2]} />

      {/* Workbench */}
      <Workbench position={[0, 0, 4]} />

      {/* Metal ingots pile */}
      <IngotPile position={[5, 0, 5]} />

      {/* Barrel of water for quenching */}
      <WaterBarrel position={[-5, 0, -3]} />
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
      <meshStandardMaterial color="#3d3d3d" roughness={0.9} />
    </mesh>
  )
}

interface WallWithDoorwayProps {
  position: [number, number, number]
  wallHeight: number
  wallDepth: number
  doorWidth: number
  doorHeight: number
}

function WallWithDoorway({
  position,
  wallHeight,
  wallDepth,
  doorWidth,
  doorHeight,
}: WallWithDoorwayProps) {
  const sideWidth = (wallDepth - doorWidth) / 2
  const topHeight = wallHeight - doorHeight

  return (
    <group position={position}>
      {/* Left section */}
      <mesh castShadow receiveShadow position={[0, wallHeight / 2, -wallDepth / 2 + sideWidth / 2]}>
        <boxGeometry args={[WALL_THICKNESS, wallHeight, sideWidth]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.9} />
      </mesh>
      {/* Right section */}
      <mesh castShadow receiveShadow position={[0, wallHeight / 2, wallDepth / 2 - sideWidth / 2]}>
        <boxGeometry args={[WALL_THICKNESS, wallHeight, sideWidth]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.9} />
      </mesh>
      {/* Top section above door */}
      <mesh castShadow receiveShadow position={[0, doorHeight + topHeight / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, topHeight, doorWidth]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.9} />
      </mesh>
    </group>
  )
}

interface FurnaceProps {
  position: [number, number, number]
}

function Furnace({ position }: FurnaceProps) {
  return (
    <group position={position}>
      {/* Main furnace body */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3, 2.4, 2.5]} />
        <meshStandardMaterial color="#4a3a3a" roughness={0.95} />
      </mesh>
      {/* Chimney */}
      <mesh castShadow receiveShadow position={[0, 3.5, -0.5]}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Fire opening */}
      <mesh position={[0, 0.8, 1.3]}>
        <boxGeometry args={[1.2, 1, 0.1]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={2} />
      </mesh>
      {/* Glowing coals inside */}
      <pointLight position={[0, 0.8, 0.5]} color="#ff2200" intensity={5} distance={3} decay={2} />
    </group>
  )
}

interface AnvilProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function Anvil({ position, rotation = [0, 0, 0] }: AnvilProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.5]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Top working surface */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1, 0.15, 0.35]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Horn */}
      <mesh castShadow receiveShadow position={[0.6, 0.85, 0]} rotation={[0, 0, Math.PI / 12]}>
        <coneGeometry args={[0.1, 0.4, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

interface ToolRackProps {
  position: [number, number, number]
}

function ToolRack({ position }: ToolRackProps) {
  return (
    <group position={position}>
      {/* Rack board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.1, 1.5, 2]} />
        <meshStandardMaterial color="#4a3520" />
      </mesh>
      {/* Hanging tools (simplified as cylinders) */}
      {[-0.6, -0.2, 0.2, 0.6].map((z, i) => (
        <mesh key={i} castShadow position={[-0.15, 0.3 - i * 0.1, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

interface WorkbenchProps {
  position: [number, number, number]
}

function Workbench({ position }: WorkbenchProps) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[3, 0.15, 1.2]} />
        <meshStandardMaterial color="#5a4030" roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[
        [-1.3, 0.45, -0.5],
        [1.3, 0.45, -0.5],
        [-1.3, 0.45, 0.5],
        [1.3, 0.45, 0.5],
      ].map((pos, i) => (
        <mesh key={i} castShadow position={pos as [number, number, number]}>
          <boxGeometry args={[0.15, 0.9, 0.15]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
      ))}
      {/* Vise on bench */}
      <mesh castShadow position={[1, 1.1, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

interface IngotPileProps {
  position: [number, number, number]
}

function IngotPile({ position }: IngotPileProps) {
  const ingotColors = ['#b87333', '#c0c0c0', '#4a4a4a', '#ffd700']
  return (
    <group position={position}>
      {[
        [0, 0.1, 0],
        [0.25, 0.1, 0.1],
        [-0.2, 0.1, -0.1],
        [0.1, 0.3, 0.05],
        [-0.1, 0.3, -0.05],
      ].map((pos, i) => (
        <mesh key={i} castShadow position={pos as [number, number, number]}>
          <boxGeometry args={[0.4, 0.15, 0.2]} />
          <meshStandardMaterial
            color={ingotColors[i % ingotColors.length]}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

interface WaterBarrelProps {
  position: [number, number, number]
}

function WaterBarrel({ position }: WaterBarrelProps) {
  return (
    <group position={position}>
      {/* Barrel body */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 1, 12]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      {/* Metal bands */}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.38 + (y - 0.5) * 0.05, 0.02, 8, 24]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Water surface */}
      <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#1a3a5a" metalness={0.3} roughness={0.1} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
