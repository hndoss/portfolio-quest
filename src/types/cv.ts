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
  observatory?: ObservatoryData
}

// Observatory-specific types (responsibility verbs, not proficiency levels)
export type ResponsibilityVerb = 'Observed' | 'Operated' | 'Configured' | 'Owned'

export interface ObservabilityTool {
  id: string
  name: string
  verb: ResponsibilityVerb
  context: string // "on-call", "investigation", "dashboards", "routing"
  scope: string // factual description of responsibility
}

export interface BeaconExperience {
  rotations: string
  escalation: string
  response: string
}

export interface IncidentRecord {
  id: string
  summary: string
  role: string
  learnings: string
}

export interface ObservatoryData {
  telescope: {
    tools: ObservabilityTool[]
  }
  beacon: {
    tools: string[]
    experience: BeaconExperience
  }
  ledger: {
    incidents: IncidentRecord[]
  }
}
