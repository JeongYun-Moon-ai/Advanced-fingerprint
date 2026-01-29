# 아키텍처 가이드

> Advanced Fingerprinting의 하드웨어 기반 크로스-브라우저 핑거프린팅 아키텍처

## 1. 개요

본 라이브러리는 **하드웨어 기반 핑거프린팅** 아키텍처를 사용합니다. 브라우저나 시크릿 모드에 관계없이 동일 기기에서는 동일한 해시를 생성합니다.

### 핵심 원리

```
┌─────────────────────────────────────────────────────────────┐
│  같은 기기 → 어떤 브라우저/모드에서도 동일한 hash            │
│                                                             │
│  Chrome 일반    ─┐                                          │
│  Chrome 시크릿  ─┼──→  하드웨어 신호만 추출  ──→  동일 해시  │
│  Safari         ─┤                                          │
│  Firefox        ─┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### 모바일 테스트 결과

| 플랫폼 | 브라우저 | 테스트 횟수 | 일관성 |
|--------|----------|-------------|--------|
| iOS | Safari | 100회 | **99%+** |
| Android | Chrome | 100회 | **99%+** |

---

## 2. 하드웨어 기반 신호

### 2.1 사용되는 브라우저 독립 신호

| 신호 | 정확도 기여 | 안정성 | 설명 |
|------|-------------|--------|------|
| **GPU Renderer** | 25% | ⭐⭐⭐⭐⭐ | WebGL의 GPU 모델 정보 |
| **Shader Precision** | 12% | ⭐⭐⭐⭐⭐ | WebGL 셰이더 정밀도 |
| **Screen Resolution** | 10% | ⭐⭐⭐⭐ | 화면 해상도 + 픽셀 밀도 |
| **Hardware Concurrency** | 8% | ⭐⭐⭐⭐⭐ | CPU 코어 수 |
| **Timezone** | 8% | ⭐⭐⭐ | 시간대 |
| **WebGL Max Texture** | 7% | ⭐⭐⭐⭐⭐ | WebGL 최대 텍스처 크기 |
| **GPU Vendor** | 5% | ⭐⭐⭐⭐⭐ | GPU 제조사 |
| **Platform** | 5% | ⭐⭐⭐⭐ | 운영체제 플랫폼 |

### 2.2 제외된 불안정 신호

시크릿 모드에서 노이즈가 추가되는 신호는 제외되었습니다:

| 신호 | 제외 이유 |
|------|-----------|
| ~~Audio Fingerprint~~ | Chrome 시크릿 모드에서 랜덤 노이즈 추가 |
| ~~Canvas Hardware~~ | 시크릿 모드에서 렌더링 차이 발생 |
| ~~Device Memory~~ | 브라우저별로 다른 값 반환 |
| ~~Language~~ | 브라우저 설정에 따라 변경 가능 |

---

## 3. 브라우저 적응형 시스템

SDK가 자동으로 브라우저/OS를 감지하고 최적 가중치를 적용합니다.

### 3.1 플랫폼별 가중치

| 플랫폼 | Physical | Temporal | Behavioral | Mobile |
|--------|----------|----------|------------|--------|
| **iOS Safari** | 50% | 10% | 15% | 25% |
| **Android Chrome** | 35% | 20% | 25% | 20% |
| **Desktop** | 45% | 20% | 15% | 20% |

### 3.2 iOS Safari 노이즈 문제

Safari는 의도적으로 센서 데이터에 노이즈를 추가합니다:
- MEMS 센서 가중치 자동 감소 (6% → 2%)
- Canvas/WebGL 가중치 증가 (12% → 18%)

---

## 4. 해시 생성 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                 하드웨어 신호 수집                            │
│  GPU Renderer · WebGL Constants · Screen · Platform · TZ     │
└─────────────────────────────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      Accuracy Weight 계산           │
         │  신호별 가중치 합산 (최대 80%)       │
         └─────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      SHA-256 Hardware Hash          │
         │  동일 기기 = 동일 해시 보장          │
         └─────────────────────────────────────┘
```

### 정확도 가중치 상수

```typescript
const CROSS_BROWSER_ACCURACY_WEIGHTS = {
    BASE: 0.05,              // 기본
    GPU_RENDERER: 0.25,      // GPU 렌더러 (가장 중요)
    GPU_VENDOR: 0.05,        // GPU 벤더
    SCREEN_RESOLUTION: 0.10, // 화면 해상도
    TIMEZONE: 0.08,          // 타임존
    HARDWARE_CONCURRENCY: 0.08, // CPU 코어 수
    SHADER_PRECISION: 0.12,  // 셰이더 정밀도
    WEBGL_MAX_TEXTURE: 0.07, // WebGL 텍스처
    PLATFORM: 0.05,          // 플랫폼
    MAX_ACCURACY: 0.80,      // 최대 정확도 (80%)
};
```

---

## 5. 프라이버시 고려사항

- 모든 데이터는 온디바이스 처리
- 비가역적 해시만 서버 전송
- IP/위치 히스토리는 로컬에만 저장

---

## 6. 패키지 구조

```
Advanced_Fingerprinting/
├── packages/
│   ├── web/                 # Web SDK (TypeScript)
│   │   ├── src/
│   │   │   └── index.ts     # 메인 Fingerprinter 클래스
│   │   ├── dist/            # 빌드 출력
│   │   └── package.json
│   │
│   └── python/              # Python SDK
│       ├── src/
│       │   └── __init__.py  # Fingerprinter, Validator 클래스
│       └── pyproject.toml
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── CONTRIBUTING.md
│
├── CLAUDE.md                # Claude Code 가이드
└── README.md
```

### Web SDK vs Python SDK

| 기능 | Web SDK | Python SDK |
|------|---------|------------|
| 하드웨어 신호 수집 | ✅ (브라우저) | ❌ (서버사이드) |
| 크로스-브라우저 해시 | ✅ | ❌ |
| 핑거프린트 검증 | ❌ | ✅ (Validator) |
| 서버 저장/관리 | ❌ | ✅ |
| ML 기능 | ❌ | ✅ (옵션) |

### 일반적인 통합 패턴

```
┌─────────────┐    해시 전송    ┌─────────────┐
│  Web SDK    │ ──────────────→ │ Python SDK  │
│ (클라이언트) │               │  (서버)      │
│             │               │             │
│ getFingerprint()           │ Validator.verify()
└─────────────┘               └─────────────┘
```
