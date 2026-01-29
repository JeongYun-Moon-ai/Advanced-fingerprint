# Advanced Fingerprinting

> 하드웨어 기반 크로스-브라우저 디바이스 핑거프린팅 SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/advanced-fingerprinting.svg)](https://www.npmjs.com/package/advanced-fingerprinting)

## 특징

- **크로스-브라우저 일관성**: 동일 기기에서 브라우저/시크릿 모드 무관하게 동일 해시
- **하드웨어 기반**: WebGL 상수, GPU 정보 등 안정적인 하드웨어 신호만 사용
- **모바일 검증 완료**: iOS Safari, Android Chrome에서 99%+ 신뢰도 (100회 테스트)
- **프라이버시 우선**: 온디바이스 처리, SHA-256 해시만 전송

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
console.log(fp.accuracy); // 0.78 (최대 80%)

// 하드웨어 신호 확인
console.log(fp.signals.gpuRenderer);      // GPU 정보
console.log(fp.signals.shaderPrecision);  // WebGL 셰이더 정밀도
console.log(fp.signals.webglMaxTextureSize); // WebGL 상수
```

## 사용되는 하드웨어 신호

| 신호 | 가중치 | 설명 |
|------|--------|------|
| GPU Renderer | 25% | WebGL GPU 모델 |
| Shader Precision | 12% | WebGL 셰이더 정밀도 |
| Screen Resolution | 10% | 화면 해상도 + 픽셀 밀도 |
| Hardware Concurrency | 8% | CPU 코어 수 |
| Timezone | 8% | 시간대 |
| WebGL Max Texture | 7% | WebGL 최대 텍스처 크기 |
| GPU Vendor | 5% | GPU 제조사 |
| Platform | 5% | 운영체제 플랫폼 |
| **최대 정확도** | **80%** | |

### 제외된 불안정 신호

시크릿 모드에서 노이즈가 추가되는 신호는 제외:

- ~~Audio Fingerprint~~ - Chrome 시크릿에서 랜덤 노이즈
- ~~Canvas Hardware~~ - 시크릿 모드에서 렌더링 차이
- ~~Device Memory~~ - 브라우저별 다른 값
- ~~Language~~ - 브라우저 설정에 따라 변경

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│            Hardware Signal Collection                │
│  GPU · WebGL Constants · Screen · Platform · TZ      │
└─────────────────────────────────────────────────────┘
                        ↓
         ┌─────────────────────────────┐
         │   Accuracy Weight Calc       │
         │   (Max 80%)                  │
         └─────────────────────────────┘
                        ↓
         ┌─────────────────────────────┐
         │   SHA-256 Hardware Hash      │
         │   Same device = Same hash    │
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
