# Advanced Fingerprinting

> 하드웨어 기반 크로스-브라우저 디바이스 핑거프린팅 SDK (v3)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/advanced-fingerprinting.svg)](https://www.npmjs.com/package/advanced-fingerprinting)

## 특징

- **크로스-브라우저 일관성**: 동일 기기에서 브라우저/시크릿 모드 무관하게 동일 해시
- **개체 식별 (v3)**: 동일 모델/동일 OS 버전의 기기도 고유하게 구분 (GPU 실리콘 편차, 오디오 DAC 편차 활용)
- **하드웨어 기반**: 28개 안정적 하드웨어 신호 수집 (v1: 8개 → v2: 16개 → v3: 20개)
- **모바일 최적화**: iOS Safari, Android Chrome에서 99%+ 신뢰도 (100회 테스트)
- **영속성 레이어**: 5-layer evercookie (localStorage, sessionStorage, Cookie, IndexedDB, Cache API)
- **프라이버시 우선**: 온디바이스 처리, SHA-256 해시만 전송
- **최대 97% 정확도**: v1(80%) → v2(95%) → v3(97%)

## 테스트 결과

| 플랫폼 | 브라우저 | 테스트 횟수 | 일관성 |
|--------|----------|-------------|--------|
| iOS | Safari | 100회 | **99%+** |
| Android | Chrome | 100회 | **99%+** |
| Desktop | Chrome / Chrome Incognito | 100회 | **99%+** |

## 설치

### Web (TypeScript/JavaScript)

```bash
npm install advanced-fingerprinting
```

### Python

```bash
pip install advanced-fingerprinting
```

## 빠른 시작

```typescript
import { getFingerprint } from 'advanced-fingerprinting';

const fp = await getFingerprint();

console.log(fp.hash);     // "a1b2c3d4..." (하드웨어 기반 해시)
console.log(fp.accuracy); // 0.95 (최대 97%)

// v1 기본 신호
console.log(fp.signals.gpuRenderer);       // GPU 정보
console.log(fp.signals.shaderPrecision);   // WebGL 셰이더 정밀도

// v2 강화 신호
console.log(fp.signals.mathEngineHash);    // JS 엔진 정밀도
console.log(fp.signals.fontHash);          // 설치된 폰트
console.log(fp.signals.audioStackHash);    // DynamicsCompressor

// v3 개체 식별 신호 (동일 모델 구분)
console.log(fp.signals.gpuSiliconHash);    // GPU 제조 편차
console.log(fp.signals.audioHardwareHash); // 오디오 DAC 편차
console.log(fp.signals.canvasMicroHash);   // 서브픽셀 렌더링 편차

// 영속성 (이전 해시 복원)
console.log(fp.previousHash);             // 5-layer 저장소에서 복원
```

## 하드웨어 신호 (v3 기준)

### v1 기본 신호

| 신호 | 가중치 | 설명 |
|------|--------|------|
| GPU Renderer | 10% | WebGL GPU 모델 |
| Shader Precision | 5% | WebGL 셰이더 정밀도 |
| Screen Resolution | 5% | 화면 해상도 + 픽셀 밀도 |
| Hardware Concurrency | 3% | CPU 코어 수 |
| Timezone | 3% | 시간대 |
| WebGL Max Texture | 3% | WebGL 최대 텍스처 크기 |
| GPU Vendor | 2% | GPU 제조사 |
| Platform | 2% | 운영체제 플랫폼 |

### v2 강화 신호

| 신호 | 가중치 | 설명 |
|------|--------|------|
| Math Engine | 5% | JS 엔진 부동소수점 정밀도 (V8/JSC/SpiderMonkey) |
| Font Fingerprint | 5% | Canvas 기반 폰트 탐지 (40+ 폰트) |
| WebGL Render | 4% | GPU 래스터라이저 렌더링 해시 |
| CSS Features | 3% | CSS.supports() 매트릭스 (35+ 기능) |
| Intl API | 3% | Intl 날짜/숫자 포맷 |
| Audio Stack | 3% | OfflineAudioContext DynamicsCompressor |
| WebGL2 Params | 3% | WebGL2 하드웨어 상수 |
| Media Capabilities | 2% | 비디오/오디오 코덱 지원 |

### v3 개체 식별 신호 (동일 모델 구분 핵심)

| 신호 | 가중치 | 설명 |
|------|--------|------|
| **GPU Silicon** | **12%** | GPU 제조 편차 - 3개 복잡 셰이더 (sin/cos, exp/log, atan/pow) |
| **Audio Hardware** | **10%** | 오디오 DAC 편차 - 3개 OfflineAudioContext 설정 |
| **Canvas Micro** | **8%** | 서브픽셀 안티앨리어싱 편차 |
| **Storage Profile** | **4%** | StorageManager 용량/사용량 프로파일 |

**최대 정확도: 97%**

### 제외된 불안정 신호

시크릿 모드에서 노이즈가 추가되는 신호는 제외:

- ~~Audio Fingerprint (직접 재생)~~ - Chrome 시크릿에서 랜덤 노이즈
- ~~Canvas Hardware (일반 렌더링)~~ - 시크릿 모드에서 렌더링 차이
- ~~Device Memory~~ - 브라우저별 다른 값
- ~~Language~~ - 브라우저 설정에 따라 변경

## 아키텍처

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

## 문서

- [아키텍처 가이드](./docs/ARCHITECTURE.md)
- [API 레퍼런스](./docs/API_REFERENCE.md)
- [기여 가이드](./docs/CONTRIBUTING.md)

## 개발

### Web Package (packages/web)

```bash
cd packages/web
npm install        # 의존성 설치
npm run dev        # 개발 모드 (watch)
npm run build      # 프로덕션 빌드
npm run test       # Jest 테스트
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷팅
```

### Python Package (packages/python)

```bash
cd packages/python
pip install -e ".[dev]"   # 개발 의존성 포함 설치
pytest                     # 테스트 실행
black src                  # 코드 포맷팅
isort src                  # import 정렬
mypy src                   # 타입 검사
```

## 프라이버시

- 모든 데이터는 온디바이스에서 처리
- 서버로 전송되는 것은 비가역적 SHA-256 해시만
- GDPR, PIPA 등 개인정보보호법 준수 필요

## 라이선스

MIT License - [LICENSE](./LICENSE) 참조
