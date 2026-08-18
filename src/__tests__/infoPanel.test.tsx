import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import InfoPanel from '../components/ui/InfoPanel'
import { useGameStore } from '../stores/gameStore'
import { HOURGLASS_CONTENT_ID } from '../components/canvas/hallLayout'
/**
 * The real cv.json, not a fixture. The panel's whole job is rendering that
 * file's shape, so a hand-written stub would keep passing after the shape
 * changed underneath it. Imported the same way `areas.test.ts` takes
 * viewpoints.json — that is what `resolveJsonModule` is on for.
 */
import cv from '../../public/data/cv.json'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => cv }) as unknown as Response)
  )
  useGameStore.setState({ activeInfoPoint: null })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('InfoPanel', () => {
  it('renders nothing while no info point is active', async () => {
    const { container } = render(<InfoPanel />)
    // The CV fetch still resolves even with nothing rendered; flushing it here
    // keeps its state update from landing outside act() in a later test.
    await act(async () => {})
    expect(container).toBeEmptyDOMElement()
  })

  it('shows an area name and its skills', async () => {
    useGameStore.setState({ activeInfoPoint: 'central-hall' })
    render(<InfoPanel />)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    // findBy, not getBy: the dialog mounts as soon as an info point is set,
    // but its heading is the "…" placeholder until the CV fetch resolves.
    // Awaiting the dialog alone raced that fetch and failed ~3 runs in 5.
    expect(await screen.findByText('Central Hall')).toBeInTheDocument()
    expect(screen.getByText('About Me')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    useGameStore.setState({ activeInfoPoint: 'central-hall' })
    render(<InfoPanel />)
    await screen.findByRole('dialog')

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(useGameStore.getState().activeInfoPoint).toBeNull()
  })

  it('closes when the scrim behind the dialog is clicked', async () => {
    useGameStore.setState({ activeInfoPoint: 'central-hall' })
    render(<InfoPanel />)
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByTestId('info-panel-scrim'))

    expect(useGameStore.getState().activeInfoPoint).toBeNull()
  })

  it('stays open when the dialog itself is clicked', async () => {
    useGameStore.setState({ activeInfoPoint: 'central-hall' })
    render(<InfoPanel />)

    fireEvent.click(await screen.findByRole('dialog'))

    expect(useGameStore.getState().activeInfoPoint).toBe('central-hall')
  })

  /**
   * Imported rather than hardcoded: the point of the test is that whatever
   * the hourglass opens lands on the time view, so hardcoding the id would
   * let the two drift apart silently.
   */
  it('shows years of experience and the summary for the hourglass', async () => {
    useGameStore.setState({ activeInfoPoint: HOURGLASS_CONTENT_ID })
    render(<InfoPanel />)

    await screen.findByRole('dialog')
    expect(
      await screen.findByText(String(cv.profile.yearsExperience))
    ).toBeInTheDocument()
    expect(screen.getByText(/years/i)).toBeInTheDocument()
    expect(screen.getByText(cv.profile.summary)).toBeInTheDocument()
  })
})

/**
 * These two views arrived on main after this panel was rewritten, and the
 * rewrite had no route for them: `getContentById('beacon')` resolves to null,
 * so without the port the Observatory's panels open onto "Loading…" and stay
 * there. That is the regression these guard.
 */
describe('InfoPanel observatory views', () => {
  it('shows the beacon tools and rotations', async () => {
    useGameStore.setState({ activeInfoPoint: 'beacon' })
    render(<InfoPanel />)

    expect(await screen.findByText('Signal Beacon')).toBeInTheDocument()
    // The heading comes from FIXED_VIEWS and paints with no data at all, so
    // it is the fields that have to be awaited.
    expect(await screen.findByText('Rotations')).toBeInTheDocument()
    expect(
      screen.getByText(cv.observatory.beacon.experience.rotations)
    ).toBeInTheDocument()
    expect(
      screen.getByText(cv.observatory.beacon.tools[0])
    ).toBeInTheDocument()
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
  })

  it('shows every incident in the ledger', async () => {
    useGameStore.setState({ activeInfoPoint: 'ledger' })
    render(<InfoPanel />)

    expect(await screen.findByText('Observation Ledger')).toBeInTheDocument()
    expect(await screen.findByText('Incident Records')).toBeInTheDocument()
    for (const incident of cv.observatory.ledger.incidents) {
      expect(screen.getByText(incident.summary)).toBeInTheDocument()
    }
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
  })
})
