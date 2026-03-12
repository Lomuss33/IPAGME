# IPAGME

IPAGME is a GitHub Pages-ready subnetting game built with React and a C++ subnet engine compiled to WebAssembly.

## Quick summary

The app gives the player a random IPv4 host address and CIDR prefix, then asks for the correct network address.

The page is split into three working areas:

- a quiz card with score, streak, and answer feedback
- a split visualizer and manual subnet calculator
- a 2^x decimal lookup table for fast subnet math
- a bottom 3x3 emoji packet grid that shows how IP packets move through a small home network

## What it includes

- IPv4 subnet quiz with easy, medium, hard, and mixed difficulty
- C++ engine for question generation, answer validation, subnet math, and 2^x table data
- Split visualizer with binary network/host highlighting
- Manual subnet calculator for any IPv4 CIDR input
- 2^x helper table with 8, 16, 24, and 32-bit views
- Network window with a stepable emoji packet board covering CCNA protocol and service topics such as DHCP, DNS, ARP, OSPF, SSH, HTTPS, RADIUS, NAT, and IPsec
- Native C++ tests and Vitest component tests
- GitHub Actions workflow for Pages deployment

## Stack

- React + TypeScript + Vite
- C++20 core logic
- Emscripten for browser WebAssembly builds
- GitHub Pages static deployment

## Repo map

```text
src/app/           App state, shared types, copy, and session persistence
src/components/    Quiz card, stats HUD, visualizer, calculator, power table, network window
src/styles/        Theme, layout, and responsive styling
src/wasm/          C++ subnet engine, wasm bridge, and Emscripten build script
src/test/          Vitest component tests
tests/cpp/         Native C++ regression tests
.github/workflows/ GitHub Pages CI/CD
```

## Local development

Install dependencies:

```bash
npm install
```

Build the WebAssembly artifacts first. This requires Emscripten on your machine:

```bash
npm run build:wasm
```

Then start the Vite dev server:

```bash
npm run dev
```

If `em++` is not on your shell `PATH`, first activate Emscripten in the current terminal, for example:

```bash
emsdk_env.bat
```

## Tests

Run both native and frontend tests:

```bash
npm test
```

## Production build

```bash
npm run build
```

That runs the Emscripten build and then creates a static `dist/` output suitable for GitHub Pages.

## Deployment

Push to `main` and GitHub Actions will:

1. install Node
2. install Emscripten
3. build the app
4. publish `dist/` to GitHub Pages

The Vite build uses a relative base path so the static bundle works on GitHub project pages, custom domains, and local static previews without rewriting `/IPAGME/...` asset URLs.

If GitHub Pages shows a white screen, open the browser devtools network tab first. The usual cause is missing JS or CSS assets from a wrong base path, which prevents React from mounting at all.

## Maintainer notes

Use [MAINTAINING.md](MAINTAINING.md) for:

- current implementation status
- missing implementations and backlog
- smoke-test workflow
- local maintainer commands and release checks
