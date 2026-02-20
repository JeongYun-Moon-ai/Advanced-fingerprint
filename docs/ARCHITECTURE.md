# 아키텍처 가이드

> Advanced Fingerprinting v3의 하드웨어 기반 크로스-브라우저 핑거프린팅 아키텍처

## 1. 개요

본 라이브러리는 **하드웨어 기반 핑거프린팅** 아키텍처를 사용합니다. 브라우저나 시크릿 모드에 관계없이 동일 기기에서는 동일한 해시를 생성하며, v3부터는 **동일 모델/동일 OS 버전**의 기기도 고유하게 식별합니다.

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

v3 추가: 동일 모델 iPhone도 GPU/DAC 제조 편차로 개체 식별
```

### 모바일 테스트 결과

| 플랫폼 | 브라우저 | 테스트 횟수 | 일관성 |
|--------|----------|-------------|--------|
| iOS | Safari | 100회 | **99%+** |
| Android | Chrome | 100회 | **99%+** |

---

## 2. 하드웨어 신호 체계

### 2.1 v1 기본 신호 (크로스-브라우저 안정성)

| 신호 | 가중치 | 안정성 | 설명 |
|------|--------|--------|------|
| **GPU Renderer** | 10% | 매우높음 | WebGL GPU 모델 정보 |
| **Shader Precision** | 5% | 매우높음 | WebGL 셰이더 정밀도 |
| **Screen Resolution** | 5% | 높음 | 화면 해상도 + 픽셀 밀도 |
| **Hardware Concurrency** | 3% | 매우높음 | CPU 코어 수 |
| **Timezone** | 3% | 보통 | 시간대 |
| **WebGL Max Texture** | 3% | 매우높음 | WebGL 최대 텍스처 크기 |
| **GPU Vendor** | 2% | 매우높음 | GPU 제조사 |
| **Platform** | 2% | 높음 | 운영체제 플랫폼 |

### 2.2 v2 강화 신호 (엔트로피 증가)

| 신호 | 가중치 | 설명 |
|------|--------|------|
| **Math Engine** | 5% | JS 엔진 부동소수점 정밀도 (V8/JSC/SpiderMonkey 차이) |
| **Font Fingerprint** | 5% | Canvas 기반 폰트 탐지 (40+ 폰트) |
| **WebGL Render** | 4% | GPU 래스터라이저 삼각형/그래디언트 렌더링 |
| **CSS Features** | 3% | CSS.supports() 매트릭스 (35+ 기능) |
| **Intl API** | 3% | Intl 날짜/숫자/리스트 포맷 |
| **Audio Stack** | 3% | OfflineAudioContext DynamicsCompressor 해시 |
| **WebGL2 Params** | 3% | WebGL2 하드웨어 상수 |
| **Media Capabilities** | 2% | 비디오/오디오 코덱 지원 |

### 2.3 v3 개체 식별 신호 (동일 모델 구분)

| 신호 | 가중치 | 원리 | 설명 |
|------|--------|------|------|
| **GPU Silicon** | **12%** | 제조 편차 | 3개 복잡 GLSL 셰이더 (sin/cos, exp/log, atan/pow 체인) → 16x16 픽셀 그리드 읽기 → GPU 실리콘별 부동소수점 라운딩 차이 |
| **Audio Hardware** | **10%** | DAC 편차 | 3개 OfflineAudioContext 설정 → 샘플 레벨 분석 → 오디오 DAC 하드웨어별 처리 차이 |
| **Canvas Micro** | **8%** | 렌더링 편차 | 서브픽셀 텍스트 + 도형 렌더링 → 안티앨리어싱 미세 차이 |
| **Storage Profile** | **4%** | 사용량 차이 | StorageManager API → 기기별 저장소 할당/사용량 차이 |

### 2.4 제외된 불안정 신호

| 신호 | 제외 이유 |
|------|-----------|
| ~~Audio Fingerprint (직접 재생)~~ | Chrome 시크릿 모드에서 랜덤 노이즈 추가 |
| ~~Canvas Hardware (일반 렌더링)~~ | 시크릿 모드에서 렌더링 차이 발생 |
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

### 3.2 iOS Safari 특이사항

- Safari 센서 노이즈 추가 → MEMS 가중치 자동 감소
- Battery API 미지원 → WebGL/Fonts/Intl 가중치 보상
- GPU Silicon 셰이더 핑거프린팅은 iOS에서도 권한 없이 작동

---

## 4. 해시 생성 흐름

```
┌───────────────────────────────────────────────────────────────┐
│                 하드웨어 신호 수집 (v3)                         │
│  v1: GPU · WebGL · Screen · Platform · Timezone               │
│  v2: Math · Fonts · CSS · Intl · Audio · WebGL2 · Media       │
│  v3: GPU Silicon · Audio DAC · Canvas Micro · Storage Profile │
└───────────────────────────────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      28개 신호 SHA-256 해시          │
         │  12개 해시 병렬 계산 (v2+v3)         │
         │  + 16개 기본 신호 연결               │
         └─────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      Accuracy Weight 계산            │
         │  신호별 가중치 합산 (최대 97%)        │
         └─────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      PersistenceManager              │
         │  5-layer evercookie 저장/복원/동기화  │
         └─────────────────────────────────────┘
                           ↓
         ┌─────────────────────────────────────┐
         │      최종 Fingerprint 반환           │
         │  hash + accuracy + signals +         │
         │  previousHash + modules              │
         └─────────────────────────────────────┘
```

### 정확도 가중치 상수 (v3)

```typescript
const CROSS_BROWSER_ACCURACY_WEIGHTS = {
    BASE: 0.02,
    // v1 기본 신호
    GPU_RENDERER: 0.10,
    GPU_VENDOR: 0.02,
    SCREEN_RESOLUTION: 0.05,
    TIMEZONE: 0.03,
    HARDWARE_CONCURRENCY: 0.03,
    SHADER_PRECISION: 0.05,
    WEBGL_MAX_TEXTURE: 0.03,
    PLATFORM: 0.02,
    // v2 강화 신호
    MATH_ENGINE: 0.05,
    WEBGL_RENDER: 0.04,
    FONT_FINGERPRINT: 0.05,
    CSS_FEATURES: 0.03,
    INTL_API: 0.03,
    AUDIO_STACK: 0.03,
    WEBGL2_PARAMS: 0.03,
    MEDIA_CAPABILITIES: 0.02,
    // v3 개체 식별 신호
    GPU_SILICON: 0.12,
    AUDIO_HARDWARE: 0.10,
    CANVAS_MICRO: 0.08,
    STORAGE_PROFILE: 0.04,
    MAX_ACCURACY: 0.97,
};
```

---

## 5. 영속성 레이어 (PersistenceManager)

5-layer evercookie 패턴으로 해시 지속성을 보장합니다.

| 저장소 | 만료 | 특징 |
|--------|------|------|
| localStorage | 영구 | 기본 저장소 |
| sessionStorage | 세션 | 세션 중 빠른 접근 |
| Cookie | 400일 | 서드파티 쿠키 차단 대응 |
| IndexedDB | 영구 | 대용량 안정적 저장 |
| Cache API | 영구 | Service Worker 기반 |

### 동작 흐름

1. **persist()**: 모든 5개 저장소에 해시 저장
2. **recover()**: 저장소 순회하여 기존 해시 복원
3. **resync()**: 복원 후 빠진 저장소 재동기화

---

## 6. 프라이버시 고려사항

- 모든 데이터는 온디바이스 처리
- 비가역적 해시만 서버 전송
- IP/위치 히스토리는 로컬에만 저장

---

## 7. 패키지 구조

```
Advanced_Fingerprinting/
├── packages/
│   ├── web/                 # Web SDK (TypeScript)
│   │   ├── src/
│   │   │   └── index.ts     # Fingerprinter (v3: 28 signals)
│   │   ├── dist/            # 빌드 출력
│   │   └── package.json
│   │
│   └── python/              # Python SDK
│       ├── src/
│       │   └── __init__.py  # Fingerprinter, Validator
│       └── pyproject.toml
│
├── docs/
│   ├── ARCHITECTURE.md      # 아키텍처 (본 문서)
│   ├── API_REFERENCE.md     # API 레퍼런스
│   └── CONTRIBUTING.md      # 기여 가이드
│
├── examples/
│   ├── demo.html            # 데모 페이지
│   └── cross-browser-test.html  # 크로스 브라우저 테스트
│
├── CLAUDE.md                # Claude Code 가이드
└── README.md
```

### Web SDK vs Python SDK

| 기능 | Web SDK | Python SDK |
|------|---------|------------|
| 하드웨어 신호 수집 | v3 (28 신호) | 서버사이드 |
| 크로스-브라우저 해시 | 동일 기기 동일 해시 | N/A |
| 개체 식별 (v3) | GPU/DAC 편차 | N/A |
| 영속성 레이어 | 5-layer evercookie | N/A |
| 핑거프린트 검증 | N/A | Validator |
| 서버 저장/관리 | N/A | Redis/DB |
| ML 기능 | N/A | 옵션 |

### 일반적인 통합 패턴

```
┌─────────────┐    해시 전송    ┌─────────────┐
│  Web SDK    │ ──────────────→ │ Python SDK  │
│ (클라이언트) │               │  (서버)      │
│             │               │             │
│ getFingerprint()           │ Validator.verify()
│ (v3: 97% accuracy)        │
└─────────────┘               └─────────────┘
```
