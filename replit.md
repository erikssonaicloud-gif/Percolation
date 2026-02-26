# Percolation Engine

A mobile Expo React Native app that implements the Observer-Operator Percolation Engine — a cognitive science tool for analyzing file interaction patterns and detecting workflow fragmentation.

## Architecture

- **Frontend**: Expo Router (React Native) with file-based routing
- **Backend**: Express.js (port 5000) — serves API and landing page
- **Frontend dev server**: Expo (port 8081)
- **Storage**: Local computation only (no database needed)

## Key Features

### Percolation Dashboard (`app/(tabs)/index.tsx`)
- Runs JS percolation analysis on demo file interaction data
- Computes Fragmentation, κ Coupling, and P∞ metrics per day
- Animated metric cards with color-coded severity
- Expandable day cards with SVG network graph visualization
- Three demo days: Flow State, Transition, Observer Crisis

### Spawning Detector (`app/(tabs)/detector.tsx`)
- Detects files that "spawned" copies/versions
- Groups files by normalized base name
- Severity ratings (HIGH/MEDIUM/LOW) by cluster size
- Expandable clusters showing all related files

## Core Logic

- `lib/percolation.ts` — Full percolation engine port from Python:
  - `buildPercolationNetwork()` — builds graph from events with time-window edges
  - `calculatePercolationMetrics()` — union-find connected components, computes frag/kappa/poo
  - `detectSpawningClusters()` — normalizes filenames to detect version families
  - Demo data: `DEMO_EVENTS`, `DEMO_SPAWNING_FILES`

- `components/NetworkGraph.tsx` — SVG-based network visualization using react-native-svg
  - Circular layout for nodes
  - Edge opacity scales with connection weight
  - Color coding: Cyan = Observer, Orange = Operator, Green = Inert

## Design

- Dark navy scientific theme (`#0A0E1A` background)
- Cyan (`#00D4FF`) for Observer nodes / Dashboard
- Orange (`#FF6B2B`) for Operator nodes / Detector
- Native tabs with liquid glass on iOS 26+, classic blurred tab bar on older iOS/Android

## Workflows

- `Start Backend`: `npm run server:dev` — Express on port 5000
- `Start Frontend`: `npm run expo:dev` — Expo on port 8081
