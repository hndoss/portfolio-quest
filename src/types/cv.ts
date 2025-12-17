export interface Profile {
  name: string
  title: string
  summary: string
  contact: {
    email?: string
    linkedin?: string
    github?: string
  }
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface SkillItem {
  id: string
  title: string
  description: string
  level: SkillLevel
  years?: number
  projects?: string[]
}

export interface Area {
  id: string
  name: string
  category: string
  description: string
  items: SkillItem[]
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  highlights?: string[]
}

export interface CVData {
  profile: Profile
  areas: Area[]
  projects: Project[]
}
