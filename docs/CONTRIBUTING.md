# 기여 가이드

> Advanced Fingerprinting v3 프로젝트에 기여하는 방법

환영합니다! 이 문서는 프로젝트에 기여하고자 하는 분들을 위한 가이드입니다.

## 시작하기

### 저장소 설정

```bash
# 저장소 포크 후 클론
git clone https://github.com/YOUR_USERNAME/advanced-fingerprinting.git
cd advanced-fingerprinting
```

### Web 패키지 (TypeScript)

```bash
cd packages/web

# 의존성 설치
npm install

# 개발 서버 실행 (watch 모드)
npm run dev

# 빌드
npm run build

# 테스트
npm run test

# 린트
npm run lint

# 코드 포맷팅
npm run format
```

### Python 패키지

```bash
cd packages/python

# 개발 의존성 포함 설치
pip install -e ".[dev]"

# 테스트
pytest

# 코드 포맷팅
black src
isort src

# 타입 검사
mypy src
```

### 브랜치 전략

- `main`: 안정 릴리스 버전
- `develop`: 개발 중인 기능 통합
- `feature/*`: 새 기능 개발
- `fix/*`: 버그 수정
- `docs/*`: 문서 수정

```bash
# 새 기능 브랜치 생성
git checkout -b feature/your-feature-name
```

---

## 코드 스타일

### TypeScript/JavaScript

- ESLint + Prettier 사용
- 세미콜론 필수
- 2칸 들여쓰기

```typescript
// Good
function calculateFingerprint(data: SensorData): string {
  const normalized = normalizeData(data);
  return hashFunction(normalized);
}

// Bad
function calculateFingerprint(data) {
    const normalized = normalizeData(data)
    return hashFunction(normalized)
}
```

### Python

- Black + isort 사용
- PEP 8 준수
- Type hints 권장

```python
# Good
def calculate_fingerprint(data: SensorData) -> str:
    normalized = normalize_data(data)
    return hash_function(normalized)
```

---

## 커밋 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류

| Type | 설명 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 스타일 변경 (기능 변화 없음) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/설정 변경 |
| `perf` | 성능 개선 |

### 예시

```bash
feat(v3): add GPU silicon manufacturing variance detection

- Implement 3 complex GLSL shaders (sin/cos, exp/log, atan/pow)
- Read 16x16 pixel grid for floating-point rounding differences
- Add accuracy weight: GPU_SILICON: 0.12

Closes #123
```

---

## Pull Request 가이드

### PR 체크리스트

- [ ] 코드가 린트 규칙을 통과합니다
- [ ] 모든 테스트가 통과합니다
- [ ] 새 기능에 대한 테스트를 추가했습니다
- [ ] 문서를 업데이트했습니다
- [ ] 크로스-브라우저 테스트를 완료했습니다

### PR 템플릿

```markdown
## 설명
이 PR이 무엇을 변경하는지 간략히 설명

## 변경 유형
- [ ] 버그 수정
- [ ] 새 기능
- [ ] 문서 수정
- [ ] 리팩토링

## 크로스-브라우저 테스트
- [ ] Chrome 일반
- [ ] Chrome 시크릿
- [ ] Safari
- [ ] Firefox
- [ ] iOS Safari
- [ ] Android Chrome

## 관련 이슈
Closes #

## 테스트 방법
변경사항을 어떻게 테스트할 수 있는지 설명
```

---

## 새 신호 추가하기

새로운 핑거프린팅 신호를 추가하려면 아래 단계를 따르세요.

### 1. 데이터 타입 인터페이스 추가

```typescript
// packages/web/src/index.ts

/** 새 신호 데이터 */
interface YourSignalData {
  feature1: number;
  feature2: string;
}
```

### 2. CrossBrowserSignals에 해시 필드 추가

```typescript
export interface CrossBrowserSignals {
  // ... 기존 28개 필드 ...
  /** 새 신호 해시 */
  yourSignalHash: string;
}
```

### 3. 수집 메서드 추가

```typescript
private async fingerprintYourSignal(): Promise<YourSignalData> {
  try {
    // 신호 수집 로직
    return { feature1: ..., feature2: ... };
  } catch {
    return { feature1: 0, feature2: '' };
  }
}
```

### 4. generateHardwareHash()에 통합

```typescript
private async generateHardwareHash(signatures: LayerDetails) {
  // ... 기존 코드 ...

  // 새 신호 수집 및 해시
  const yourSignalData = await this.fingerprintYourSignal();
  const yourSignalHash = await FingerprintUtils.sha256(
    JSON.stringify(yourSignalData)
  );

  // signals에 추가
  const signals: CrossBrowserSignals = {
    // ... 기존 신호들 ...
    yourSignalHash,
  };

  // stableData에 포함
  const stableData = [
    // ... 기존 데이터 ...
    yourSignalHash,
  ].join('|');
}
```

### 5. 가중치 추가

```typescript
const CROSS_BROWSER_ACCURACY_WEIGHTS = {
  // ... 기존 가중치 ...
  YOUR_SIGNAL: 0.05,    // 가중치 (전체 합 <= MAX_ACCURACY)
  MAX_ACCURACY: 0.97,   // 필요시 상향 조정
};
```

### 6. 크로스-브라우저 검증

새 신호 추가 시 필수 테스트:
1. Chrome 일반 vs Chrome 시크릿 → **동일 값**
2. Chrome vs Safari vs Firefox → **동일 값**
3. iOS Safari vs Android Chrome → **동일 값** (모바일)
4. 동일 모델 기기 간 → **다른 값** (v3 수준 신호인 경우)

### 7. 문서 업데이트

- `README.md`의 하드웨어 신호 테이블 업데이트
- `docs/API_REFERENCE.md`의 CrossBrowserSignals 업데이트
- `docs/ARCHITECTURE.md`의 신호 가중치 테이블 업데이트
- `CLAUDE.md`의 가중치 및 메서드 목록 업데이트

---

## 이슈 리포팅

### 버그 리포트

```markdown
## 버그 설명
무엇이 잘못되었는지 명확하게 설명

## 재현 방법
1. '...' 로 이동
2. '...' 클릭
3. 오류 발생

## 예상 동작
어떻게 동작해야 하는지

## 환경
- OS: [e.g. Windows 11, macOS 14, iOS 18]
- 브라우저: [e.g. Chrome 120]
- SDK 버전: [e.g. 1.0.0]
```

### 기능 요청

```markdown
## 제안하는 기능
원하는 기능에 대한 명확한 설명

## 사용 사례
이 기능이 어떤 문제를 해결하는지

## 크로스-브라우저 안정성
이 신호가 시크릿 모드/다른 브라우저에서도 안정적인지

## 구현 제안 (선택)
어떻게 구현할 수 있을지에 대한 아이디어
```

---

## 코드 리뷰

리뷰어로서:
- 크로스-브라우저 안정성 확인
- 시크릿 모드에서의 일관성 검증
- 성능 영향 평가
- 건설적인 피드백 제공

리뷰 받는 입장:
- 리뷰어의 의견 존중
- 크로스-브라우저 테스트 결과 첨부
- 결정에 대한 근거 설명

---

## 연락처

- 디스코드: [서버 링크]
- 이메일: maintainers@example.com
- 이슈 트래커: GitHub Issues
