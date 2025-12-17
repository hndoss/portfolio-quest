import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { usePlayerControls } from '../../hooks/usePlayerControls'

const MOVE_SPEED = 5
const PLAYER_HEIGHT = 1.8

export default function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  const { forward, backward, left, right } = usePlayerControls()

  useFrame((state) => {
    if (!rigidBodyRef.current) return

    const camera = state.camera
    const velocity = rigidBodyRef.current.linvel()

    // Get movement direction from camera
    const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward))
    const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0)

    const direction = new THREE.Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED)
      .applyEuler(camera.rotation)

    // Apply horizontal movement while preserving vertical velocity
    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    )

    // Update camera position to follow player
    const position = rigidBodyRef.current.translation()
    camera.position.set(position.x, position.y + PLAYER_HEIGHT / 2, position.z)
  })

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <RigidBody
        ref={rigidBodyRef}
        position={[0, 2, 5]}
        enabledRotations={[false, false, false]}
        linearDamping={0.5}
      >
        <CapsuleCollider args={[PLAYER_HEIGHT / 2 - 0.5, 0.5]} />
      </RigidBody>
    </>
  )
}
