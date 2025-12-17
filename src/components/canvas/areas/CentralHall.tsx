const ROOM_SIZE = 20
const WALL_HEIGHT = 6
const WALL_THICKNESS = 0.5

export default function CentralHall() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* Walls */}
      {/* North wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, -ROOM_SIZE / 2]}
        size={[ROOM_SIZE, WALL_HEIGHT, WALL_THICKNESS]}
      />
      {/* South wall */}
      <Wall
        position={[0, WALL_HEIGHT / 2, ROOM_SIZE / 2]}
        size={[ROOM_SIZE, WALL_HEIGHT, WALL_THICKNESS]}
      />
      {/* East wall */}
      <Wall
        position={[ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_SIZE]}
      />
      {/* West wall */}
      <Wall
        position={[-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_SIZE]}
      />

      {/* Decorative center pillar */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3, 8]} />
        <meshStandardMaterial color="#5a5a5a" />
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
      <meshStandardMaterial color="#4a4a4a" />
    </mesh>
  )
}
