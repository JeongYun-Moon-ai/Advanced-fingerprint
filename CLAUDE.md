# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hardware-based cross-browser device fingerprinting library. Generates consistent hashes across different browsers/modes on the same device. Supports both TypeScript (web) and Python packages.

**Key Feature**: Same device = Same hash (regardless of browser, incognito mode, etc.)

**Mobile Test Results**: 99%+ consistency on iOS Safari and Android Chrome (100 tests each)

## Build & Development Commands

### Web Package (packages/web)
```bash
npm install              # Install dependencies
npm run dev              # Development mode with watch
npm run build            # Production build (rollup)
npm run test             # Run Jest tests
npm run lint             # ESLint check
npm run format           # Prettier format
```

### Python Package (packages/python)
```bash
pip install -e ".[dev]"  # Install with dev dependencies
pytest                   # Run tests
black src                # Format code
isort src                # Sort imports
mypy src                 # Type checking
```

## Architecture

### Hardware-Based Fingerprinting System

```
┌─────────────────────────────────────────────────────┐
│            Hardware Signal Collection                │
│  GPU Renderer · WebGL Constants · Screen · Platform  │
└─────────────────────────────────────────────────────┘
                        ↓
         ┌─────────────────────────────┐
         │   Accuracy Weight Calculation │
         │   (Max 80% accuracy)          │
         └─────────────────────────────┘
                        ↓
         ┌─────────────────────────────┐
         │   SHA-256 Hardware Hash      │
         │   Same device = Same hash    │
         └─────────────────────────────┘
```

### Hardware Signals Used

Only stable signals that don't change in incognito mode:

| Signal | Weight | Stability |
|--------|--------|-----------|
| GPU Renderer | 25% | ⭐⭐⭐⭐⭐ |
| Shader Precision | 12% | ⭐⭐⭐⭐⭐ |
| Screen Resolution | 10% | ⭐⭐⭐⭐ |
| Hardware Concurrency | 8% | ⭐⭐⭐⭐⭐ |
| Timezone | 8% | ⭐⭐⭐ |
| WebGL Max Texture | 7% | ⭐⭐⭐⭐⭐ |

### Excluded Unstable Signals

Removed due to noise in incognito mode:
- ~~Audio Fingerprint~~ (Chrome adds random noise)
- ~~Canvas Hardware~~ (rendering differences)
- ~~Device Memory~~ (varies by browser)
- ~~Language~~ (browser-specific)

### Key Classes

- `Fingerprinter` (packages/web/src/index.ts): Main SDK entry point
- `generateHardwareHash()`: Core function for hardware-based fingerprinting
- `getStableWebGLInfo()`: Extracts stable WebGL constants
- `BehavioralTracker`: Collects touch, keystroke, gait data (optional)
- `FingerprintUtils`: SHA-256 hashing, FFT, statistical functions

### Fingerprint Interface

```typescript
interface Fingerprint {
  hash: string;              // Hardware-based hash (browser/mode agnostic)
  accuracy: number;          // 0-0.80 (max 80%)
  modules: string[];
  signals: CrossBrowserSignals;
  details?: LayerDetails;
}
```

### Adding New Hardware Signals

1. Verify signal is stable across browsers/incognito modes
2. Add to `CrossBrowserSignals` interface
3. Update `generateHardwareHash()` to include signal
4. Add weight to `CROSS_BROWSER_ACCURACY_WEIGHTS`
5. Test on Chrome, Chrome Incognito, Safari, Firefox

## Code Style

- TypeScript: ESLint + Prettier, semicolons required, 2-space indent
- Python: Black + isort, PEP 8, type hints required
- Conventional Commits format for commit messages
