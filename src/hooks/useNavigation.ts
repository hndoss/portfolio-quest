import { useState, useEffect, useMemo } from 'react'
import type { NavigationData, Viewpoint } from '../types/navigation'
import { useGameStore } from '../stores/gameStore'

export function useNavigation() {
  const [navigationData, setNavigationData] = useState<NavigationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentViewpoint = useGameStore((state) => state.currentViewpoint)

  useEffect(() => {
    fetch('/data/viewpoints.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load viewpoints')
        return res.json()
      })
      .then((data: NavigationData) => {
        setNavigationData(data)
      })
      .catch((err) => {
        setError(err.message)
        console.error('Error loading navigation data:', err)
      })
  }, [])

  const currentViewpointData = useMemo<Viewpoint | null>(() => {
    if (!navigationData || !currentViewpoint) return null
    return navigationData.viewpoints.find((v) => v.id === currentViewpoint) || null
  }, [navigationData, currentViewpoint])

  const viewpoints = useMemo(() => {
    return navigationData?.viewpoints || []
  }, [navigationData])

  const startViewpoint = navigationData?.startViewpoint || null

  return {
    viewpoints,
    currentViewpointData,
    startViewpoint,
    isLoading: !navigationData && !error,
    error,
  }
}
