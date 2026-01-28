# 🔐 Advanced Fingerprinting

> 다중 계층 엔트로피 융합 기반 고정밀 모바일 디바이스 핑거프린팅 오픈소스 라이브러리

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/advanced-fingerprinting.svg)](https://www.npmjs.com/package/advanced-fingerprinting)
[![PyPI version](https://badge.fury.io/py/advanced-fingerprinting.svg)](https://pypi.org/project/advanced-fingerprinting/)

## 🌟 특징

- **하드웨어 기반 핑거프린팅**: 브라우저/시크릿 모드에 관계없이 동일 기기면 동일 해시
- **크로스-브라우저 호환**: Chrome, Safari, Firefox 등 브라우저 간 일관된 핑거프린트
- **모바일 최적화**: iOS Safari, Android Chrome에서 99%+ 신뢰도 검증 (100회 테스트)
- **🆕 브라우저 적응형**: iOS/Android/Desktop 자동 감지 및 가중치 최적화
- **프라이버시 우선**: 온디바이스 처리, 익명화된 해시만 전송
- **이력 추적**: IP/위치 변화 히스토리 자동 저장

## 📱 브라우저/플랫폼 적응형 가중치

SDK가 자동으로 브라우저와 OS를 감지하여 최적의 가중치를 적용합니다:

| 플랫폼 | Physical | Behavioral | 이유 |
|--------|----------|------------|------|
| **iOS Safari** | 50% ⬆️ | 15% ⬇️ | 센서 노이즈로 Canvas/WebGL 집중 |
| **Android Chrome** | 35% | 25% ⬆️ | 센서 풀 접근, Gait 신뢰 |
| **Twitter 인앱 (Android)** | 35% | 25% | Android WebView 사용 |
| Desktop | 45% | 15% | 기본 |

## 📊 지원 모듈 (18개)

| 계층 | 모듈 | 기본 기여 | iOS 조정 | 설명 |
|------|------|-----------|----------|------|
| 🔧 **Physical** | `canvas` | 12% | **18%** | Canvas 렌더링 |
| | `webgl` | 10% | **15%** | GPU 정보 |
| | `mems` | 6% | 2% | 센서 바이어스 |
| | `audio-frf` | 6% | 6% | 주파수 응답 |
| | `prnu` | 8% | 8% | 카메라 노이즈 |
| ⏱️ **Temporal** | `battery-stl` | 5% | **0%** | API 없음 (iOS) |
| 👆 **Behavioral** | `gait` | 4% | 1% | 보행 패턴 |
| 📱 **Mobile** | `screen` | 5% | **8%** | 화면 정보 |
| | `speech` | 5% | **8%** | TTS 음성 |

## 📦 설치

```bash
npm install advanced-fingerprinting
```

## 🚀 빠른 시작

```typescript
import { Fingerprinter, getFingerprint, getBrowserInfo } from 'advanced-fingerprinting';

// 간단한 사용 (자동 최적화)
const fingerprint = await getFingerprint();
console.log(fingerprint.hash);     // "a1b2c3d4..." (하드웨어 기반, 브라우저 무관)
console.log(fingerprint.accuracy); // 0.78 (최대 80%)

// 브라우저 정보 확인
const browserInfo = getBrowserInfo();
console.log(browserInfo);
// { browser: 'chrome', os: 'android', sensorReliability: 'high', isInAppBrowser: false }

// 고급 사용 (디버그 모드)
const fp = new Fingerprinter({ debug: true });
console.log(fp.getBrowserInfo()); // 감지된 브라우저 정보

await fp.requestPermissions();
const result = await fp.generate({ enableGait: true, enablePRNU: true });

// 하드웨어 신호 확인
console.log(result.signals.gpuRenderer);      // GPU 정보
console.log(result.signals.shaderPrecision);  // WebGL 셰이더 정밀도
```

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                 Hardware-Based Signals                       │
│  GPU Renderer · WebGL Constants · Screen · Platform · TZ     │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌─────────────────────────┐
              │   Browser Detection     │
              │   → Adaptive Weights    │
              └─────────────────────────┘
                           ↓
              ┌─────────────────────────┐
              │   Hardware Hash Engine   │
              │   SHA-256(Σ signals)     │
              └─────────────────────────┘
                           ↓
              ┌─────────────────────────┐
              │   Cross-Browser Hash    │
              │   동일 기기 = 동일 해시   │
              └─────────────────────────┘
```

자세한 내용은 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)를 참조하세요.

## 📚 문서

- [아키텍처 가이드](./docs/ARCHITECTURE.md) - 4계층 구조 + 브라우저 적응 상세
- [API 레퍼런스](./docs/API_REFERENCE.md) - 전체 API 문서
- [기여 가이드](./docs/CONTRIBUTING.md) - 프로젝트 기여 방법

## ⚠️ 프라이버시 및 법적 고려사항

- ✅ 모든 원천 데이터는 온디바이스에서만 처리
- ✅ 서버로 전송되는 것은 비가역적 해시값만
- ⚠️ 각 국가의 개인정보보호법 준수 필요 (GDPR, PIPA 등)

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE)를 참조하세요.

---

<p align="center">
  Made with ❤️ by the Advanced Fingerprinting Community
</p>
