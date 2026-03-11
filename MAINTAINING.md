# IPAGME Maintainer README

This file tracks the current implementation state, the known missing pieces, and the minimum checks to run before publishing changes.

## Current implementation status

### Working now

- React/Vite app shell with a polished single-page layout
- C++ subnet engine compiled to WebAssembly through Emscripten
- Quiz flow for IPv4 network-address questions
- Difficulty selector with weighted mixed mode
- Session HUD for score, streak, accuracy, solved count, and current difficulty
- Split visualizer with binary network/host highlighting
- Manual subnet calculator with CIDR parsing and subnet breakdown
- Expandable 2^x decimal table
- Bottom network window with a 3x3 emoji packet grid and a CCNA protocol/service story catalog
- Native C++ regression tests and frontend component tests
- GitHub Pages deployment workflow

### Deliberately not implemented yet

- IPv6 question generation and IPv6 calculator logic
- Localized Croatian and German UI
- Additional game modes beyond the main quiz
- Browser end-to-end testing
- Analytics, telemetry, or player history beyond session storage

## Missing implementations backlog

Mark items complete here when they land in the codebase.

- [ ] Add browser-level smoke coverage for wasm loading and the first playable question on a static build
- [ ] Add explicit visual display for the previous and next subnet boundary around the current quiz host
- [ ] Add a manual "Show answer" or "Hint" flow for learning mode without affecting score
- [ ] Add persistent UI preferences for active helper tab and selected 2^x table size
- [ ] Add localization scaffolding for Croatian and German copy packs
- [ ] Add IPv6-ready engine branches instead of schema-only `addressFamily` placeholders
- [ ] Add terminal line highlighting tied to the active packet frame
- [ ] Add richer packet motion and alternate board routes to the network window stories
- [ ] Add a quiz-linked network window mode that reuses the current subnet
- [ ] Add richer README assets such as screenshots or a short demo capture

## Project workflow

### Install

```bash
npm install
```

### Native tests

```bash
npm run test:cpp
```

### Frontend tests

```bash
npm run test:web
```

### Full test pass

```bash
npm test
```

### Type check

```bash
npx tsc --noEmit
```

### Build wasm + production app

Emscripten must be active in the current shell first.

```bash
emsdk_env.bat
npm run build
```

## Smoke-test checklist

Run this after significant UI, engine, or build changes.

1. Start the app and confirm the title line, HUD, quiz card, helper panel, power table, and network window render without runtime errors.
2. Submit one correct answer and verify score, streak, accuracy, and feedback all update.
3. Submit one invalid answer and verify the app shows validation feedback without breaking the session.
4. Switch difficulties and confirm a fresh question loads.
5. Use the subnet calculator with `192.168.54.201/26`, `10.44.199.3/20`, and `172.16.130.99/17`.
6. Expand the 2^x table to 16, 24, and 32 bits.
7. Scroll through the network-window chip rail and click several CCNA topics such as DHCP, DNS, OSPF, SSH, HTTPS, and RADIUS to confirm the story panel updates.
8. Press `Start` in the network window and confirm the packet runs once and stops on the last frame, then use `Next` to step frame-by-frame.
9. Build the production bundle and confirm `dist/wasm/subnet_engine.js` and `dist/wasm/subnet_engine.wasm` exist.

## Notes for future maintainers

- The repo intentionally does not commit generated wasm artifacts.
- The app depends on the C++ engine for quiz logic; do not duplicate subnet logic in TypeScript unless there is a strong reason.
- If the public interface of the wasm payloads changes, update both the TypeScript types and the native tests in the same change.
