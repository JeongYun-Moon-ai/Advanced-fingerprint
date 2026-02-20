# API 레퍼런스

> Advanced Fingerprinting v3 전체 API 문서

## 목차

- [Quick Start](#quick-start)
- [브라우저 감지 API](#브라우저-감지-api)
- [Fingerprinter 클래스](#fingerprinter-클래스)
- [PersistenceManager](#persistencemanager)
- [설정 인터페이스](#설정-인터페이스)
- [결과 타입](#결과-타입)

---

## Quick Start

```typescript
import { getFingerprint, Fingerprinter, getBrowserInfo } from 'advanced-fingerprinting';

// 간단한 사용 (v3 자동 최적화)
const fp = await getFingerprint();
console.log(fp.hash);     // 하드웨어 기반 해시 (브라우저/모드 무관)
console.log(fp.accuracy); // 정확도 (0-0.97)

// v3 개체 식별 신호 확인
console.log(fp.signals.gpuSiliconHash);    // GPU 제조 편차
console.log(fp.signals.audioHardwareHash); // 오디오 DAC 편차
console.log(fp.signals.canvasMicroHash);   // 서브픽셀 렌더링 편차

// 영속성 복원
console.log(fp.previousHash); // 이전 저장된 해시 (5-layer evercookie)

// 브라우저 정보 확인
const info = getBrowserInfo();
// { browser: 'chrome', os: 'android', sensorReliability: 'high' }

// 고급 사용 (디버그 모드)
const fingerprinter = new Fingerprinter({ debug: true });
console.log(fingerprinter.getBrowserInfo());
```

---

## 브라우저 감지 API

### BrowserInfo

```typescript
interface BrowserInfo {
  browser: 'chrome' | 'safari' | 'firefox' | 'edge' | 'samsung' | 'inapp' | 'unknown';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  isInAppBrowser: boolean;
  sensorReliability: 'high' | 'medium' | 'low';
}
```

### detectBrowser()

브라우저와 OS를 감지합니다.

```typescript
import { detectBrowser } from 'advanced-fingerprinting';

const info = detectBrowser();
console.log(info.browser);          // 'chrome'
console.log(info.os);               // 'android'
console.log(info.isInAppBrowser);   // false
console.log(info.sensorReliability); // 'high'
```

### getBrowserInfo()

캐싱된 브라우저 정보를 반환합니다 (성능 최적화).

### getAdaptiveWeights(browserInfo)

플랫폼에 최적화된 가중치를 반환합니다.

```typescript
import { detectBrowser, getAdaptiveWeights } from 'advanced-fingerprinting';

const info = detectBrowser();
const weights = getAdaptiveWeights(info);
// iOS: { physical: 0.50, temporal: 0.10, behavioral: 0.15, mobile: 0.25 }
// Android: { physical: 0.35, temporal: 0.20, behavioral: 0.25, mobile: 0.20 }
```

---

## Fingerprinter 클래스

### 생성자

```typescript
constructor(config?: Partial<FingerprintConfig>)
```

**자동 적응형 가중치**: 플랫폼에 최적화된 가중치가 자동 적용됩니다.

```typescript
// 자동 최적화 (권장)
const fp = new Fingerprinter({ debug: true });

// 수동 가중치 지정 (옵션)
const fp2 = new Fingerprinter({
  weights: { physical: 0.5, temporal: 0.2, behavioral: 0.2, mobile: 0.1 }
});
```

### 메서드

#### `getBrowserInfo(): BrowserInfo`

현재 감지된 브라우저 정보를 반환합니다.

#### `requestPermissions(): Promise<boolean>`

iOS에서 DeviceMotion/DeviceOrientation 권한을 요청합니다.

#### `generate(config?): Promise<Fingerprint>`

핑거프린트를 생성합니다. v3에서는 자동으로 개체 식별 신호를 수집합니다.

```typescript
const fp = await fingerprinter.generate({
  enableGait: true,
  enablePRNU: true,
  debug: true,
});
```

#### `startBehavioralTracking() / stopBehavioralTracking()`

터치/키스트로크 이벤트 수집을 시작/중지합니다.

#### `startGaitCollection() / stopGaitCollection()`

보행 패턴 수집을 시작/중지합니다.

### v2 강화 메서드 (내부)

| 메서드 | 설명 |
|--------|------|
| `fingerprintMathEngine()` | JS 엔진 부동소수점 정밀도 해시 |
| `fingerprintWebGLRender()` | GPU 삼각형/그래디언트 래스터라이저 해시 |
| `detectFonts()` | Canvas 기반 폰트 탐지 (40+ 폰트) |
| `fingerprintCSSFeatures()` | CSS.supports() 매트릭스 (35+ 기능) |
| `fingerprintIntlAPI()` | Intl 날짜/숫자/리스트 포맷 해시 |
| `fingerprintAudioStack()` | OfflineAudioContext DynamicsCompressor |
| `getWebGL2Parameters()` | WebGL2 하드웨어 상수 |
| `fingerprintMediaCapabilities()` | 비디오/오디오 코덱 지원 |

### v3 개체 식별 메서드 (내부)

| 메서드 | 설명 |
|--------|------|
| `fingerprintGPUSilicon()` | 3개 복잡 GLSL 셰이더로 GPU 실리콘 제조 편차 탐지 (sin/cos, exp/log, atan/pow 체인 → 16x16 픽셀 그리드) |
| `fingerprintAudioHardware()` | 3개 OfflineAudioContext 설정으로 오디오 DAC 하드웨어 편차 탐지 (샘플 레벨 분석) |
| `fingerprintCanvasMicro()` | 서브픽셀 텍스트 + 도형 렌더링 → 안티앨리어싱 미세 차이 탐지 |
| `fingerprintStorageProfile()` | StorageManager API → 기기별 저장소 할당/사용량 프로파일 |

---

## PersistenceManager

5-layer evercookie 패턴으로 핑거프린트 해시의 지속성을 보장합니다.

### 저장소

| 저장소 | 만료 | 키 |
|--------|------|-----|
| localStorage | 영구 | `_fp_h` |
| sessionStorage | 세션 | `_fp_h` |
| Cookie | 400일 | `_fp_h` |
| IndexedDB | 영구 | `fp_store` DB, `hashes` 스토어 |
| Cache API | 영구 | `fp-cache` 캐시 |

### 메서드

```typescript
// 모든 저장소에 해시 저장
await PersistenceManager.persist(hash: string): Promise<void>

// 기존 해시 복원 (5개 저장소 순회)
await PersistenceManager.recover(): Promise<string | null>

// 복원 후 빠진 저장소 재동기화
await PersistenceManager.resync(hash: string): Promise<void>
```

---

## 설정 인터페이스

### FingerprintConfig

```typescript
interface FingerprintConfig {
  layers: {
    physical: boolean;
    temporal: boolean;
    behavioral: boolean;
    mobile: boolean;
  };
  weights: {
    physical: number;   // 기본: 플랫폼별 자동
    temporal: number;
    behavioral: number;
    mobile: number;
  };
  timeout?: number;              // 기본: 15000ms
  debug?: boolean;               // 기본: false
  samplingDuration?: number;     // 기본: 2000ms
  enableGait?: boolean;          // 기본: false (권한 필요 - iOS 센서)
  enablePRNU?: boolean;          // 기본: false (권한 필요 - 카메라)
  enableGeolocation?: boolean;   // 기본: false (권한 필요 - 위치)
  enableMEMSPermission?: boolean; // 기본: false (권한 필요 - iOS MEMS 센서)
}
```

### 권한 필요 옵션

| 옵션 | 권한 | 설명 |
|------|------|------|
| `enableGait` | iOS 센서 | 보행 패턴 분석 |
| `enablePRNU` | 카메라 | 카메라 센서 노이즈 분석 |
| `enableGeolocation` | 위치 | GPS 위치 정보 수집 |
| `enableMEMSPermission` | iOS 센서 | iOS에서 MEMS 센서 접근 |

---

## 결과 타입

### Fingerprint

```typescript
interface Fingerprint {
  /** 디바이스 핑거프린트 해시 (브라우저/모드 무관, 동일 기기면 동일) */
  hash: string;
  timestamp: number;
  /** 예상 정확도 (0-0.97, 최대 97%) */
  accuracy: number;
  /** 수집된 모듈 목록 */
  modules: string[];
  /** 하드웨어 신호 상세 정보 (28개 필드) */
  signals: CrossBrowserSignals;
  /** 이전 저장된 해시 (PersistenceManager에서 복원, 추적 연속성) */
  previousHash?: string;
  /** 상세 레이어 정보 (debug: true 시) */
  details?: LayerDetails;
}
```

### CrossBrowserSignals

```typescript
interface CrossBrowserSignals {
  // === GPU 특성 (WebGL) ===
  gpuRenderer: string;
  gpuVendor: string;

  // === 화면 특성 ===
  screenResolution: string;
  availableScreen: string;
  pixelRatio: number;
  colorDepth: number;

  // === 시스템 특성 ===
  timezone: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  platform: string;

  // === WebGL 하드웨어 상수 ===
  shaderPrecision: string;
  webglMaxTextureSize: number;
  webglMaxViewportDims: string;
  webglExtensionCount: number;
  webglMaxRenderbufferSize: number;
  webglMaxVertexAttribs: number;

  // === v2 강화 신호 ===
  mathEngineHash: string;      // JS 엔진 부동소수점 정밀도
  webglRenderHash: string;     // GPU 래스터라이저 렌더링
  fontHash: string;            // 설치된 폰트
  cssFeatureHash: string;      // CSS Feature Matrix
  intlHash: string;            // Intl API 포맷
  audioStackHash: string;      // AudioContext DynamicsCompressor
  webgl2Hash: string;          // WebGL2 파라미터
  mediaCapHash: string;        // 미디어 코덱 지원

  // === v3 개체 식별 신호 (동일 모델 구분) ===
  gpuSiliconHash: string;      // GPU 실리콘 제조 편차
  audioHardwareHash: string;   // 오디오 DAC 하드웨어 편차
  canvasMicroHash: string;     // Canvas 서브픽셀 렌더링 편차
  storageProfileHash: string;  // Storage 용량/사용량 프로파일
}
```

### 정확도 가중치 (v3)

| 신호 | 가중치 | 카테고리 |
|------|--------|----------|
| GPU Silicon | 12% | v3 개체 식별 |
| Audio Hardware | 10% | v3 개체 식별 |
| GPU Renderer | 10% | v1 기본 |
| Canvas Micro | 8% | v3 개체 식별 |
| Math Engine | 5% | v2 강화 |
| Shader Precision | 5% | v1 기본 |
| Screen Resolution | 5% | v1 기본 |
| Font Fingerprint | 5% | v2 강화 |
| Storage Profile | 4% | v3 개체 식별 |
| WebGL Render | 4% | v2 강화 |
| Hardware Concurrency | 3% | v1 기본 |
| Timezone | 3% | v1 기본 |
| CSS Features | 3% | v2 강화 |
| Intl API | 3% | v2 강화 |
| Audio Stack | 3% | v2 강화 |
| WebGL Max Texture | 3% | v1 기본 |
| WebGL2 Params | 3% | v2 강화 |
| GPU Vendor | 2% | v1 기본 |
| Platform | 2% | v1 기본 |
| Media Capabilities | 2% | v2 강화 |
| Base | 2% | 기본 |
| **최대 정확도** | **97%** | |

---

## 브라우저 호환성

| 기능 | Chrome | Chrome 시크릿 | Safari | Firefox |
|------|--------|---------------|--------|---------|
| v1 Hardware Hash | OK | OK | OK | OK |
| v2 Enhanced Signals | OK | OK | OK | OK |
| v3 GPU Silicon | OK | OK | OK | OK |
| v3 Audio Hardware | OK | OK | OK | OK |
| v3 Canvas Micro | OK | OK | OK | OK |
| PersistenceManager | OK | 부분 | OK | OK |

### 모바일 테스트 결과

| 플랫폼 | 브라우저 | 테스트 횟수 | 일관성 |
|--------|----------|-------------|--------|
| iOS | Safari | 100회 | **99%+** |
| Android | Chrome | 100회 | **99%+** |

---

## Python SDK

서버사이드에서 핑거프린트 검증 및 저장에 사용합니다.

### 설치

```bash
pip install advanced-fingerprinting

# Optional dependencies
pip install advanced-fingerprinting[ml]    # ML 기능
pip install advanced-fingerprinting[redis] # Redis 저장소
pip install advanced-fingerprinting[dev]   # 개발 도구
```

### 기본 사용법

```python
from advanced_fingerprinting import Fingerprinter, get_fingerprint

# 간단한 사용
fp = get_fingerprint()
print(fp.hash)        # SHA-256 해시
print(fp.confidence)  # 신뢰도 (0-1)

# 고급 사용
fingerprinter = Fingerprinter()
result = fingerprinter.generate()
```

### Validator 클래스

핑거프린트 등록 및 검증을 위한 클래스입니다.

```python
from advanced_fingerprinting import Validator

validator = Validator()

# 등록
validator.register("device_123", "hash_abc...")

# 검증
result = validator.verify("device_123", "hash_abc...")
print(result)
# {'is_valid': True, 'reason': 'match', 'confidence': 1.0}
```

### Python 타입 정의

```python
@dataclass
class FingerprintConfig:
    layers: Dict[str, bool]   # {"physical": True, "temporal": True, "behavioral": False}
    weights: Dict[str, float] # {"physical": 0.5, "temporal": 0.3, "behavioral": 0.2}
    timeout: int = 10000
    debug: bool = False

@dataclass
class Fingerprint:
    hash: str
    timestamp: float
    confidence: float
    modules: List[str]
    details: Optional[Dict[str, Any]] = None
```
