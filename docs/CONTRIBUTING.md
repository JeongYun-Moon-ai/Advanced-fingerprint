# 기여 가이드

> Advanced Fingerprinting 프로젝트에 기여하는 방법

환영합니다! 🎉 이 문서는 프로젝트에 기여하고자 하는 분들을 위한 가이드입니다.

## 시작하기

### 저장소 설정

```bash
# 저장소 포크 후 클론
git clone https://github.com/YOUR_USERNAME/advanced-fingerprinting.git
cd advanced-fingerprinting

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
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
// ✅ Good
function calculateFingerprint(data: SensorData): string {
  const normalized = normalizeData(data);
  return hashFunction(normalized);
}

// ❌ Bad
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
# ✅ Good
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

### 예시

```bash
feat(mems): add gyroscope cross-axis error analysis

- Implement cross-axis error calculation
- Add unit tests for edge cases
- Update documentation

Closes #123
```

---

## Pull Request 가이드

### PR 체크리스트

- [ ] 코드가 린트 규칙을 통과합니다
- [ ] 모든 테스트가 통과합니다
- [ ] 새 기능에 대한 테스트를 추가했습니다
- [ ] 문서를 업데이트했습니다
- [ ] CHANGELOG.md를 업데이트했습니다

### PR 템플릿

```markdown
## 설명
이 PR이 무엇을 변경하는지 간략히 설명

## 변경 유형
- [ ] 버그 수정
- [ ] 새 기능
- [ ] 문서 수정
- [ ] 리팩토링

## 관련 이슈
Closes #

## 테스트 방법
변경사항을 어떻게 테스트할 수 있는지 설명
```

---

## 새 모듈 추가하기

새로운 핑거프린팅 모듈을 추가하려면:

### 1. 모듈 인터페이스 구현

```typescript
// packages/core/src/modules/your-module.ts
import { BaseModule, ModuleSignature } from '../types';

export class YourModule extends BaseModule {
  readonly name = 'your-module';
  readonly layer = 'physical'; // 'physical' | 'temporal' | 'behavioral'
  
  async analyze(): Promise<ModuleSignature> {
    // 분석 로직 구현
    return {
      type: this.name,
      data: { /* ... */ },
      confidence: 0.95
    };
  }
}
```

### 2. 테스트 작성

```typescript
// packages/core/src/modules/__tests__/your-module.test.ts
import { YourModule } from '../your-module';

describe('YourModule', () => {
  it('should generate consistent signatures', async () => {
    const module = new YourModule();
    const sig1 = await module.analyze();
    const sig2 = await module.analyze();
    
    expect(sig1.type).toBe('your-module');
    expect(sig1.confidence).toBeGreaterThan(0.8);
  });
});
```

### 3. 모듈 등록

```typescript
// packages/core/src/index.ts
export { YourModule } from './modules/your-module';
```

### 4. 문서 업데이트

- README.md의 지원 모듈 테이블 업데이트
- API_REFERENCE.md에 모듈 API 추가

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
- OS: [e.g. Windows 11, macOS 14]
- 브라우저: [e.g. Chrome 120]
- SDK 버전: [e.g. 1.0.0]
```

### 기능 요청

```markdown
## 제안하는 기능
원하는 기능에 대한 명확한 설명

## 사용 사례
이 기능이 어떤 문제를 해결하는지

## 구현 제안 (선택)
어떻게 구현할 수 있을지에 대한 아이디어
```

---

## 코드 리뷰

리뷰어로서:
- 건설적인 피드백 제공
- 질문과 제안 구분
- 좋은 코드에 대한 칭찬도 잊지 않기

리뷰 받는 입장:
- 리뷰어의 의견 존중
- 결정에 대한 근거 설명
- 빠른 응답 유지

---

## 연락처

- 디스코드: [서버 링크]
- 이메일: maintainers@example.com
- 이슈 트래커: GitHub Issues

감사합니다! 🙏
