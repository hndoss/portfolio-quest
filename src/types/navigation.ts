export interface Vector3 {
  x: number
  y: number
  z: number
}

export type HotspotIcon = 'door' | 'arrow' | 'stairs'

export interface Hotspot {
  id: string
  targetViewpoint: string
  position: Vector3
  label: string
  icon?: HotspotIcon
}

export interface InfoPointRef {
  id: string
  contentId: string
  position: Vector3
  label: string
}

export interface Viewpoint {
  id: string
  areaId: string
  position: Vector3
  lookAt: Vector3
  hotspots: Hotspot[]
  infoPoints: InfoPointRef[]
}

export interface NavigationData {
  startViewpoint: string
  viewpoints: Viewpoint[]
}
