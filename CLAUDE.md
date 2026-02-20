# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hardware-based cross-browser device fingerprinting library (v3). Generates consistent hashes across different browsers/modes on the same device, and uniquely identifies individual devices even among identical models. Supports both TypeScript (web) and Python packages.

**Key Feature**: Same device = Same hash (regardless of browser, incognito mode, etc.)
**v3 Feature**: Distinguishes identical model devices via manufacturing variance (GPU silicon, audio DAC, canvas micro rendering)

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

### Hardware-Based Fingerprinting System (v3)

```
┌───────────────────────────────────────────────────────────────┐
│              Hardware Signal Collection (v3)                   │
│  v1: GPU · WebGL · Screen · Platform · Timezone               │
│  v2: MathEngine · Fonts · CSS · Intl · Audio · WebGL2 · Media │
│  v3: GPU Silicon · Audio DAC · Canvas Micro · Storage Profile │
└───────────────────────────────────────────────────────────────┘
                            ↓
             ┌─────────────────────────────┐
             │   Accuracy Weight Calc       │
             │   (Max 97% accuracy)         │
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

### Hardware Signals (v3)

| Signal | Weight | Category |
|--------|--------|----------|
| GPU Silicon | 12% | Manufacturing variance (v3) |
| Audio Hardware | 10% | DAC manufacturing variance (v3) |
| GPU Renderer | 10% | WebGL |
| Canvas Micro | 8% | Sub-pixel rendering (v3) |
| Math Engine | 5% | JS Engine precision (v2) |
| Shader Precision | 5% | WebGL |
| Screen Resolution | 5% | Hardware |
| Font Fingerprint | 5% | OS-level fonts (v2) |
| Storage Profile | 4% | Device usage (v3) |
| WebGL Render Hash | 4% | GPU rasterizer (v2) |
| Hardware Concurrency | 3% | CPU |
| Timezone | 3% | System |
| CSS Features | 3% | Engine features (v2) |
| Intl API | 3% | Locale formatting (v2) |
| Audio Stack | 3% | DynamicsCompressor (v2) |
| WebGL Max Texture | 3% | GPU constant |
| WebGL2 Params | 3% | GPU constant (v2) |
| GPU Vendor | 2% | WebGL |
| Platform | 2% | System |
| Media Capabilities | 2% | Codec support (v2) |
| Base | 2% | Always present |

### Persistence Layer (PersistenceManager)

5-layer evercookie-style storage sync:
- localStorage, sessionStorage, Cookie (400d), IndexedDB, Cache API
- Auto-recovery: restores from any surviving storage
- Auto-resync: refills cleared storages after recovery

### Key Classes

**Web SDK (packages/web/src/index.ts)**:
- `Fingerprinter`: Main SDK entry point (v3: 28 signal fields, 20+ modules)
- `PersistenceManager`: 5-layer storage persistence (evercookie)
- `generateHardwareHash()`: Core hash from 28 stable signals
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

**v3 Device Uniqueness Methods**:
- `fingerprintGPUSilicon()`: 3 complex GLSL shaders (sin/cos, exp/log, atan/pow) reading 16x16 pixel grid to detect GPU manufacturing variance
- `fingerprintAudioHardware()`: 3 OfflineAudioContext configs with sample-level DAC analysis
- `fingerprintCanvasMicro()`: Sub-pixel text + shape rendering differences
- `fingerprintStorageProfile()`: StorageManager API quota/usage

**Python SDK (packages/python/src/__init__.py)**:
- `Fingerprinter`: Server-side fingerprint generation
- `Validator`: Fingerprint registration and verification

### Fingerprint Interface

```typescript
interface Fingerprint {
  hash: string;              // Hardware-based hash (browser/mode agnostic)
  accuracy: number;          // 0-0.97 (max 97%)
  modules: string[];
  signals: CrossBrowserSignals;  // 28 signal fields
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
6. Add weight to `CROSS_BROWSER_ACCURACY_WEIGHTS` (total with MAX_ACCURACY <= 0.97)
7. Update `getAdaptiveModuleContributions()` for mobile
8. Test on Chrome, Chrome Incognito, Safari, Firefox, iOS Safari, Android Chrome

## Code Style

- TypeScript: ESLint + Prettier, semicolons required, 2-space indent
- Python: Black + isort, PEP 8, type hints required
- Conventional Commits format for commit messages
