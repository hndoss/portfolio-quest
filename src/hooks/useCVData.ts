import { useState, useEffect, useCallback } from 'react'
import type { CVData, Area, SkillItem, Project, Profile } from '../types/cv'

export function useCVData() {
  const [cvData, setCVData] = useState<CVData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/data/cv.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load CV data')
        return res.json()
      })
      .then((data: CVData) => {
        setCVData(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
        console.error('Error loading CV data:', err)
      })
  }, [])

  // Get content by ID - could be an area, skill item, or project
  const getContentById = useCallback(
    (contentId: string): Area | SkillItem | Project | null => {
      if (!cvData) return null

      // Check if it's an area ID
      const area = cvData.areas.find((a) => a.id === contentId)
      if (area) return area

      // Check if it's a skill item ID within any area
      for (const a of cvData.areas) {
        const skill = a.items.find((item) => item.id === contentId)
        if (skill) return skill
      }

      // Check if it's a project ID
      const project = cvData.projects.find((p) => p.id === contentId)
      if (project) return project

      return null
    },
    [cvData]
  )

  // Get area by ID
  const getAreaById = useCallback(
    (areaId: string): Area | null => {
      if (!cvData) return null
      return cvData.areas.find((a) => a.id === areaId) || null
    },
    [cvData]
  )

  // Get project by ID
  const getProjectById = useCallback(
    (projectId: string): Project | null => {
      if (!cvData) return null
      return cvData.projects.find((p) => p.id === projectId) || null
    },
    [cvData]
  )

  // Get profile data
  const getProfile = useCallback((): Profile | null => {
    if (!cvData) return null
    return cvData.profile
  }, [cvData])

  return {
    cvData,
    isLoading,
    error,
    getContentById,
    getAreaById,
    getProjectById,
    getProfile,
  }
}
