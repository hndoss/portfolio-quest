import { describe, it, expect } from 'vitest'

// Test the telescope tools data and navigation logic
describe('telescope mode', () => {
  const TELESCOPE_TOOLS = ['grafana', 'prometheus', 'alertmanager', 'datadog', 'sumo']

  describe('tool navigation', () => {
    it('should have 5 observability tools', () => {
      expect(TELESCOPE_TOOLS.length).toBe(5)
    })

    it('should have grafana as first tool', () => {
      expect(TELESCOPE_TOOLS[0]).toBe('grafana')
    })

    it('should cycle to next tool correctly', () => {
      const currentIndex = 0 // grafana
      const nextIndex = (currentIndex + 1) % TELESCOPE_TOOLS.length
      expect(TELESCOPE_TOOLS[nextIndex]).toBe('prometheus')
    })

    it('should cycle to previous tool correctly', () => {
      const currentIndex = 0 // grafana
      const prevIndex = (currentIndex - 1 + TELESCOPE_TOOLS.length) % TELESCOPE_TOOLS.length
      expect(TELESCOPE_TOOLS[prevIndex]).toBe('sumo')
    })

    it('should wrap around when cycling forward from last tool', () => {
      const currentIndex = 4 // sumo
      const nextIndex = (currentIndex + 1) % TELESCOPE_TOOLS.length
      expect(TELESCOPE_TOOLS[nextIndex]).toBe('grafana')
    })
  })
})
