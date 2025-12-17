const ROOM_WIDTH = 16
const ROOM_DEPTH = 12
const WALL_HEIGHT = 5
const WALL_THICKNESS = 0.3

export default function Library() {
  return (
    <group position={[-25, 0, 0]}>
      {/* Warm lighting for library atmosphere */}
      <pointLight
        position={[0, 4, 0]}
        color="#ffa54f"
        intensity={15}
        distance={20}
        decay={2}
      />
      <pointLight
        position={[-4, 3, 2]}
        color="#ff8c00"
        intensity={8}
        distance={10}
        decay={2}
      />

      {/* Floor - wooden */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Walls */}
      {/* Back wall (west) */}
      <Wall
        position={[-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH]}
      />
      {/* Front wall (east) - with doorway */}
      <WallWithDoorway
        position={[ROOM_WIDTH / 2, 0, 0]}
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

      {/* Bookshelves along walls */}
      <Bookshelf position={[-7, 0, -4]} rotation={[0, Math.PI / 2, 0]} />
      <Bookshelf position={[-7, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Bookshelf position={[-7, 0, 4]} rotation={[0, Math.PI / 2, 0]} />

      <Bookshelf position={[0, 0, -5.5]} rotation={[0, 0, 0]} />
      <Bookshelf position={[5, 0, -5.5]} rotation={[0, 0, 0]} />

      {/* Reading table */}
      <ReadingTable position={[0, 0, 2]} />

      {/* Decorative scroll/book on pedestal */}
      <mesh castShadow position={[-5, 1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 6]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>
      <mesh castShadow position={[-5, 2, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
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
      <meshStandardMaterial color="#6b5344" />
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
        <meshStandardMaterial color="#6b5344" />
      </mesh>
      {/* Right section */}
      <mesh castShadow receiveShadow position={[0, wallHeight / 2, wallDepth / 2 - sideWidth / 2]}>
        <boxGeometry args={[WALL_THICKNESS, wallHeight, sideWidth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
      {/* Top section above door */}
      <mesh castShadow receiveShadow position={[0, doorHeight + topHeight / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, topHeight, doorWidth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
    </group>
  )
}

interface BookshelfProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function Bookshelf({ position, rotation = [0, 0, 0] }: BookshelfProps) {
  const shelfHeight = 3.5
  const shelfWidth = 2
  const shelfDepth = 0.5

  return (
    <group position={position} rotation={rotation}>
      {/* Back panel */}
      <mesh castShadow receiveShadow position={[0, shelfHeight / 2, -shelfDepth / 2 + 0.05]}>
        <boxGeometry args={[shelfWidth, shelfHeight, 0.1]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Side panels */}
      <mesh castShadow receiveShadow position={[-shelfWidth / 2 + 0.05, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.1, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      <mesh castShadow receiveShadow position={[shelfWidth / 2 - 0.05, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.1, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Shelves */}
      {[0.1, 0.9, 1.7, 2.5, 3.3].map((y, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[shelfWidth, 0.08, shelfDepth]} />
          <meshStandardMaterial color="#6b5040" />
        </mesh>
      ))}
      {/* Books on shelves */}
      <BookRow position={[0, 0.5, 0.05]} />
      <BookRow position={[0, 1.3, 0.05]} />
      <BookRow position={[0, 2.1, 0.05]} />
      <BookRow position={[0, 2.9, 0.05]} />
    </group>
  )
}

interface BookRowProps {
  position: [number, number, number]
}

function BookRow({ position }: BookRowProps) {
  const bookColors = ['#8b0000', '#00008b', '#006400', '#8b4513', '#4b0082', '#2f4f4f']

  return (
    <group position={position}>
      {bookColors.map((color, i) => (
        <mesh
          key={i}
          castShadow
          position={[-0.7 + i * 0.25, 0, 0]}
        >
          <boxGeometry args={[0.15, 0.6 + Math.random() * 0.15, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

interface ReadingTableProps {
  position: [number, number, number]
}

function ReadingTable({ position }: ReadingTableProps) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Legs */}
      {[
        [-0.8, 0.4, -0.5],
        [0.8, 0.4, -0.5],
        [-0.8, 0.4, 0.5],
        [0.8, 0.4, 0.5],
      ].map((pos, i) => (
        <mesh key={i} castShadow position={pos as [number, number, number]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
      ))}
      {/* Open book on table */}
      <mesh castShadow position={[0, 0.9, 0]} rotation={[-0.1, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.4]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
    </group>
  )
}
