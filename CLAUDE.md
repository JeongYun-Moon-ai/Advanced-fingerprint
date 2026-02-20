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
pip install -e ".[dev]"  # Install with dev dependencies (pytest, black, isort, mypy)
pytest                   # Run tests
black src                # Format code (line-length=100)
isort src                # Sort imports (profile=black)
mypy src                 # Type checking (strict mode)

# Optional dependencies
pip install -e ".[ml]"   # ML features (scikit-learn, tensorflow)
pip install -e ".[redis]" # Redis storage support
```

## Architecture

### Hardware-Based Fingerprinting System

```
┌───────────────────────────────────────────────────────────┐
│              Hardware Signal Collection (v2)               │
│  GPU · WebGL · Screen · Math Engine · Fonts · CSS · Intl  │
│  AudioStack · WebGL2 · Media Codecs · WebGL Render        │
└───────────────────────────────────────────────────────────┘
                          ↓
           ┌─────────────────────────────┐
           │   Accuracy Weight Calc       │
           │   (Max 95% accuracy)         │
           └─────────────────────────────┘
                          ↓
           ┌─────────────────────────────┐
           │   SHA-256 Hardware Hash      │
           │   Same device = Same hash    │
           └─────────────────────────────┘
                          ↓
           ┌─────────────────────────────┐
           │   PersistenceManager         │
           │   5-layer evercookie sync    │
           └─────────────────────────────┘
```

### Hardware Signals (v2)

| Signal | Weight | Category |
|--------|--------|----------|
| GPU Renderer | 15% | WebGL |
| Math Engine | 8% | JS Engine precision |
| Shader Precision | 8% | WebGL |
| Screen Resolution | 7% | Hardware |
| WebGL Render Hash | 7% | GPU rasterizer |
| Font Fingerprint | 7% | OS-level fonts |
| Hardware Concurrency | 5% | CPU |
| Timezone | 5% | System |
| Audio Stack | 5% | DynamicsCompressor |
| CSS Features | 4% | Engine features |
| Intl API | 4% | Locale formatting |
| WebGL Max Texture | 4% | GPU constant |
| WebGL2 Params | 4% | GPU constant |
| GPU Vendor | 3% | WebGL |
| Platform | 3% | System |
| Media Capabilities | 3% | Codec support |

### Persistence Layer (PersistenceManager)

5-layer evercookie-style storage sync:
- localStorage, sessionStorage, Cookie (400d), IndexedDB, Cache API
- Auto-recovery: restores from any surviving storage
- Auto-resync: refills cleared storages after recovery

### Key Classes

**Web SDK (packages/web/src/index.ts)**:
- `Fingerprinter`: Main SDK entry point (v2: 26 signal modules)
- `PersistenceManager`: 5-layer storage persistence
- `generateHardwareHash()`: Core hash from 24 stable signals
- `getStableWebGLInfo()`: WebGL hardware constants
- `BehavioralTracker`: Touch, keystroke, gait data (optional)
- `FingerprintUtils`: SHA-256, FFT, statistics

**v2 Enhanced Methods**:
- `fingerprintMathEngine()`: JS engine floating-point precision
- `fingerprintWebGLRender()`: GPU triangle/gradient rendering
- `detectFonts()`: Canvas-based font enumeration (40+ fonts)
- `fingerprintCSSFeatures()`: CSS.supports() matrix (35+ features)
- `fingerprintIntlAPI()`: Intl date/number/list formatting
- `fingerprintAudioStack()`: OfflineAudioContext DynamicsCompressor
- `getWebGL2Parameters()`: WebGL2 hardware constants
- `fingerprintMediaCapabilities()`: Video/audio codec support

**Python SDK (packages/python/src/__init__.py)**:
- `Fingerprinter`: Server-side fingerprint generation
- `Validator`: Fingerprint registration and verification

### Fingerprint Interface

```typescript
interface Fingerprint {
  hash: string;              // Hardware-based hash (browser/mode agnostic)
  accuracy: number;          // 0-0.95 (max 95%)
  modules: string[];
  signals: CrossBrowserSignals;
  previousHash?: string;     // From PersistenceManager (tracking continuity)
  details?: LayerDetails;
}
```

### Adding New Hardware Signals

1. Verify signal is stable across browsers/incognito modes
2. Add data type interface
3. Add to `CrossBrowserSignals` interface
4. Add collection method in Fingerprinter
5. Update `generateHardwareHash()` to include signal
6. Add weight to `CROSS_BROWSER_ACCURACY_WEIGHTS`
7. Update `getAdaptiveModuleContributions()` for mobile
8. Test on Chrome, Chrome Incognito, Safari, Firefox, iOS Safari, Android Chrome

## Code Style

- TypeScript: ESLint + Prettier, semicolons required, 2-space indent
- Python: Black + isort, PEP 8, type hints required
- Conventional Commits format for commit messages
