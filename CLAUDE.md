# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio Quest is a 3D interactive portfolio/resume experience built with React and Three.js. Users explore a castle-themed environment with 6 distinct areas to discover professional experience and skills through a game-like interface.

## Development Commands

```bash
npm run dev          # Start dev server with HMR
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint checks
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:coverage # Generate coverage report
```

## Architecture

### Layer Separation

The app has two rendering layers that share state:
- **Canvas Layer** (`src/components/canvas/`): React Three Fiber components for 3D scenes
- **UI Layer** (`src/components/ui/`): DOM-based React components for overlays and HUD

Both layers consume the same Zustand store (`src/stores/gameStore.ts`).

### State Management

Single Zustand store manages all application state:
- Navigation: current viewpoint, transitions, camera targets
- Areas: current area, visited areas tracking
- UI: loading state, paused state, active info point, panels

### Data Sources

Content is externalized to JSON files in `public/data/`:
- `cv.json`: Profile info, skills with expertise levels, projects
- `viewpoints.json`: Camera positions/targets, hotspots (navigation points), info points (content triggers)

Custom hooks load this data: `useNavigation()` and `useCVData()`.

### 3D Scene Structure

Six themed areas in `src/components/canvas/areas/`:
- CentralHall (main lobby with 5 doorways)
- Library, Forge, Pipelines, Treasury, Observatory

Navigation via hotspots (clickable navigation points) and smooth camera transitions (1.2s).

### Type Definitions

Located in `src/types/`:
- `game.ts`: Game state types
- `navigation.ts`: Viewpoint, hotspot, InfoPoint types
- `cv.ts`: CV content structure

## Testing

Tests use Vitest with jsdom environment and Testing Library React. Store tests are in `src/__tests__/gameStore.test.ts` with comprehensive coverage of all actions.

Run single test file:
```bash
npx vitest run src/__tests__/gameStore.test.ts
```
