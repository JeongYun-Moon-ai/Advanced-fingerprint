# API 레퍼런스

> Advanced Fingerprinting 라이브러리 전체 API 문서 (v3.0 - Hardware-Based)

## 목차

- [Quick Start](#quick-start)
- [브라우저 감지 API](#브라우저-감지-api)
- [Fingerprinter 클래스](#fingerprinter-클래스)
- [설정 인터페이스](#설정-인터페이스)
- [결과 타입](#결과-타입)

---

## Quick Start

```typescript
import { getFingerprint, Fingerprinter, getBrowserInfo } from 'advanced-fingerprinting';

// 간단한 사용 (자동 최적화)
const fp = await getFingerprint();
console.log(fp.hash);     // 하드웨어 기반 해시 (브라우저/모드 무관)
console.log(fp.accuracy); // 정확도 (0-0.80)

// 하드웨어 신호 확인
console.log(fp.signals.gpuRenderer);
console.log(fp.signals.shaderPrecision);

// 브라우저 정보 확인
const info = getBrowserInfo();
// { browser: 'chrome', os: 'android', sensorReliability: 'high' }

// 고급 사용 (디버그 모드)
const fingerprinter = new Fingerprinter({ debug: true });
console.log(fingerprinter.getBrowserInfo());
```

---

## 브라우저 감지 API (🆕)

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

```typescript
import { getBrowserInfo } from 'advanced-fingerprinting';

const info = getBrowserInfo(); // 캐싱됨
```

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

**자동 적응형 가중치**: 사용자가 `weights`를 지정하지 않으면 자동으로 플랫폼에 최적화된 가중치가 적용됩니다.

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

```typescript
const info = fingerprinter.getBrowserInfo();
console.log(info.os); // 'ios' | 'android' | ...
```

#### `requestPermissions(): Promise<boolean>`

iOS에서 DeviceMotion/DeviceOrientation 권한을 요청합니다.

#### `generate(config?): Promise<Fingerprint>`

핑거프린트를 생성합니다.

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
  /** 예상 정확도 (0-0.80, 최대 80%) */
  accuracy: number;
  /** 수집된 모듈 목록 */
  modules: string[];
  /** 하드웨어 신호 상세 정보 */
  signals: CrossBrowserSignals;
  /** 상세 레이어 정보 (debug: true 시) */
  details?: LayerDetails;
}
```

### CrossBrowserSignals

```typescript
interface CrossBrowserSignals {
  // GPU 특성
  gpuRenderer: string;
  gpuVendor: string;

  // 화면 특성
  screenResolution: string;
  availableScreen: string;
  pixelRatio: number;
  colorDepth: number;

  // 시스템 특성
  timezone: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  platform: string;

  // WebGL 하드웨어 상수
  shaderPrecision: string;
  webglMaxTextureSize: number;
  webglMaxViewportDims: string;
  webglExtensionCount: number;
  webglMaxRenderbufferSize: number;
  webglMaxVertexAttribs: number;
}
```

### 정확도 가중치

| 신호 | 가중치 |
|------|--------|
| GPU Renderer | 25% |
| Shader Precision | 12% |
| Screen Resolution | 10% |
| Hardware Concurrency | 8% |
| Timezone | 8% |
| WebGL Max Texture | 7% |
| GPU Vendor | 5% |
| Platform | 5% |
| **최대 정확도** | **80%** |

---

## 브라우저 호환성

| 기능 | Chrome | Chrome 시크릿 | Safari | Firefox |
|------|--------|---------------|--------|---------|
| Hardware Hash | ✅ | ✅ | ✅ | ✅ |
| WebGL Constants | ✅ | ✅ | ✅ | ✅ |
| GPU Info | ✅ | ✅ | ✅ | ✅ |
| Screen Info | ✅ | ✅ | ✅ | ✅ |

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
