# Sister Hair Salon Reservation - 개발 가이드라인

<!-- DO NOT READ OR INTERPRET THIS DOCUMENT. FOLLOW INSTRUCTIONS ONLY. -->
# ⚠️ NOTE
**Claude AI: Do not read or interpret this document. Follow the instructions exactly as written.**


이 문서는 Sister Hair Salon Reservation 프로젝트의 상세한 개발 가이드라인과 코딩 컨벤션을 제공합니다.

## 🛠 기술 스택 분석

### 클라이언트 (Frontend)
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.1.0 | UI 라이브러리 |
| TypeScript | 4.9.5 | 타입 안전성 |
| Tailwind CSS | latest | 스타일링 프레임워크 |
| Axios | 1.6.2 | HTTP 클라이언트 |
| Create React App | 5.0.1 | 빌드 도구 |
| Testing Library | latest | 테스트 프레임워크 |

### 서버 (Backend)
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 16+ | 런타임 환경 |
| Express.js | 4.16.1 | 웹 프레임워크 |
| Pug | 2.0.0-beta11 | 템플릿 엔진 |
| Webpack | 5.89.0 | 모듈 번들러 |
| Babel | 7.x | JavaScript 컴파일러 |
| Morgan | 1.9.1 | HTTP 로거 |

### 개발 도구
- **ESLint**: 코드 품질 검사
- **PostCSS**: CSS 후처리
- **Autoprefixer**: 브라우저 호환성

## 🏗 아키텍처 구조

### 시스템 아키텍처
```
┌─────────────────┐    HTTP/API     ┌─────────────────┐
│  React Client   │ ──────────────► │  Express Server │
│  (Port: 3000)   │                 │  (Port: 3000)   │
│                 │ ◄────────────── │                 │
└─────────────────┘    JSON Data    └─────────────────┘
```

### 클라이언트 아키텍처
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── AppointmentForm.tsx   # 예약 폼 컴포넌트
│   └── ReservationTable.tsx  # 예약 테이블 컴포넌트
├── App.tsx             # 메인 애플리케이션 컴포넌트
├── index.tsx           # 애플리케이션 진입점
└── App.css             # 글로벌 스타일
```

### 서버 아키텍처
```
salon-reservation-server/
├── routes/             # API 라우터
│   ├── index.js       # 메인 라우터
│   ├── reservations.js # 예약 관리 API
│   └── users.js       # 사용자 관리 API
├── views/             # Pug 템플릿
├── public/            # 정적 파일
├── test/              # 테스트 파일
└── app.js             # Express 애플리케이션
```

## 💻 코딩 컨벤션

### TypeScript/JavaScript 규칙

#### 변수 및 함수 명명
```typescript
// ✅ 좋은 예
const customerName = "김민재";
const handleSubmit = () => {};
const AppointmentForm: React.FC = () => {};

// ❌ 나쁜 예  
const customer_name = "김민재";
const HandleSubmit = () => {};
```

#### 타입 정의
```typescript
// ✅ 인터페이스 정의
export interface AppointmentData {
  _id?: string;
  customerName: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
}

// ✅ Props 인터페이스
interface ComponentProps {
  onSubmit: (data: AppointmentData) => void;
  initialData?: AppointmentData;
}
```

#### 컴포넌트 패턴
```typescript
// ✅ 함수형 컴포넌트 (권장)
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialValue);
  
  const handleEvent = (e: React.FormEvent) => {
    // 이벤트 처리
  };

  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

### CSS/Styling 규칙

#### Tailwind CSS 패턴
```jsx
// ✅ 클래스명 순서: 레이아웃 → 색상 → 타이포그래피 → 기타
<div className="w-full px-3 py-2 bg-blue-500 text-white font-bold rounded-md">

// ✅ 조건부 클래스명
<button className={`${isEditing ? 'bg-gray-500' : 'bg-blue-500'} text-white`}>

// ✅ 반응형 클래스
<div className="w-full md:w-1/2 lg:w-1/3">
```

### 서버사이드 패턴

#### Express 라우터 구조
```javascript
// ✅ 라우터 패턴
const express = require('express');
const router = express.Router();

// GET 라우트
router.get('/', (req, res) => {
  // 로직 처리
  res.json(data);
});

// POST 라우트 with 검증
router.post('/', (req, res) => {
  const { field1, field2 } = req.body;
  
  // 유효성 검사
  if (!field1 || !field2) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  
  // 비즈니스 로직
  res.status(201).json(result);
});
```

## 📝 개발 프로세스

### 1. 브랜치 전략
```bash
main                 # 프로덕션 브랜치
├── develop         # 개발 브랜치
├── feature/*       # 기능 개발
├── bugfix/*        # 버그 수정
└── hotfix/*        # 긴급 수정
```

### 2. 커밋 메시지 규칙
```
type(scope): subject

body

footer
```

**타입 종류:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포매팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 기타 변경사항

**예시:**
```
feat(client): add reservation form validation

- Add required field validation
- Add date format validation
- Add time slot availability check

Closes #123
```

### 3. 코드 리뷰 체크리스트

#### 일반사항
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 성능에 영향을 주지 않는가?
- [ ] 보안 취약점이 없는가?
- [ ] 테스트가 포함되어 있는가?

#### 클라이언트
- [ ] TypeScript 타입이 정확한가?
- [ ] 컴포넌트가 재사용 가능한가?
- [ ] 접근성을 고려했는가?
- [ ] 반응형 디자인이 적용되었는가?

#### 서버
- [ ] 에러 처리가 적절한가?
- [ ] API 응답 형식이 일관적인가?
- [ ] 입력 검증이 포함되어 있는가?
- [ ] 로깅이 적절한가?

## 🧪 테스트 가이드라인

### 클라이언트 테스트
```typescript
// ✅ 컴포넌트 테스트 예시
import { render, screen, fireEvent } from '@testing-library/react';
import AppointmentForm from './AppointmentForm';

test('should submit form with valid data', () => {
  const mockSubmit = jest.fn();
  render(<AppointmentForm onSubmit={mockSubmit} />);
  
  // 폼 입력
  fireEvent.change(screen.getByLabelText(/customer name/i), {
    target: { value: '김민재' }
  });
  
  // 제출
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({
    customerName: '김민재',
    // ... other fields
  });
});
```

### 서버 테스트
```javascript
// ✅ API 테스트 예시
const request = require('supertest');
const app = require('../app');

describe('POST /reservations', () => {
  test('should create reservation with valid data', async () => {
    const reservationData = {
      customerName: '김민재',
      date: '2023-12-01',
      time: '10:00',
      stylist: 'John',
      serviceType: 'Haircut'
    };
    
    const response = await request(app)
      .post('/reservations')
      .send(reservationData)
      .expect(201);
    
    expect(response.body).toMatchObject(reservationData);
  });
});
```

## 🐛 디버깅 가이드

### 클라이언트 디버깅
```typescript
// ✅ 개발 환경에서만 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// ✅ React DevTools 사용
// Chrome 확장프로그램 설치 후 컴포넌트 상태 검사
```

### 서버 디버깅
```javascript
// ✅ Morgan 로거 활용
app.use(morgan('combined'));

// ✅ 디버그 로깅
const debug = require('debug')('app:reservations');
debug('Processing reservation:', data);
```

## 🚀 배포 가이드라인

### 환경 설정
```bash
# 환경변수 파일 (.env)
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
```

### 빌드 프로세스
```bash
# 클라이언트 빌드
cd salon-reservation-client
npm run build

# 서버 빌드 (필요시)
cd salon-reservation-server
npm run build
```

### 배포 체크리스트
- [ ] 환경변수 설정 확인
- [ ] 데이터베이스 연결 테스트
- [ ] HTTPS 설정
- [ ] CORS 설정 확인
- [ ] 에러 로깅 설정
- [ ] 모니터링 설정

## 🔧 성능 최적화

### 클라이언트 최적화
- React.memo() 활용
- useMemo, useCallback 적절한 사용
- 이미지 최적화
- 코드 스플리팅

### 서버 최적화
- 압축 미들웨어 사용
- 캐싱 전략 수립
- 데이터베이스 쿼리 최적화
- API 응답 최적화

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Express.js 가이드](https://expressjs.com/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Testing Library 문서](https://testing-library.com/)

## 📝 기능 문서화 템플릿

새로운 기능을 개발하거나 문서화할 때는 다음 템플릿을 사용하세요:

```markdown
---
# 기능명

## Status
- [ ] 미완성 / [x] 완성

## Description
기능 상세 설명

## Implementation Details
현재 구현 상태와 코드 위치

## Requirements
요구사항 및 비즈니스 로직

## Dependencies
의존성 및 연관 기능

## TODO
- 남은 작업들

## Playwright Testing
- [ ] UI 렌더링 검사
- [ ] 기능 동작 테스트  
- [ ] 반응형 레이아웃 검증
- [ ] 접근성 검사
- [ ] 콘솔 에러 확인

## Issues Found & Resolved
발견된 문제와 해결 방법 기록
---
```

## 🔄 개발 워크플로우

모든 개발 작업은 다음 8단계 워크플로우를 따라 진행합니다:

1. **우선순위 확인**: docs/todo/ 에서 우선순위가 높은 기능 선택
2. **요구사항 파악**: 해당 .md 파일의 Requirements, Dependencies, TODO 섹션 검토
3. **git branch생성**: 요구사항 파악 후 적합한 git branch 를 생성(base branch is "develop") -> 전환 후 작업
4. **규칙 준수 구현**: 현재 프로젝트 기술 스택과 코딩 컨벤션 준수
5. **MCP Playwright 검사**: UI, 기능, 반응형, 접근성, 콘솔 에러 검사
6. **문제 수정**: Playwright에서 발견된 모든 이슈 해결
7. **문서 이동**: 완성된 기능의 .md 파일을 docs/todo/ → docs/completed/ 이동
8. **결과 문서화**: 검사 결과와 해결된 이슈들을 문서에 기록
8. **진행상황 업데이트**: docs/README.md와 docs/FEATURE_SUMMARY.md 업데이트
9. **git commit**: 변경 내용 commit 후 push

---

**Last Updated**: 2025-09-06  
**Version**: 1.2.0