---
# 관리자 인증 시스템 (Administrator Authentication)

## Status
- [ ] 미완성

## Description
현재 시스템은 누구나 예약을 생성/수정/삭제할 수 있습니다. 보안을 위해 관리자 로그인 시스템을 구현하여 오직 인증된 관리자만 예약 관리가 가능하도록 합니다.

## Implementation Details
### 현재 상태
#### 보안 취약점
- 누구나 예약 생성/수정/삭제 가능
- 인증/인가 시스템 없음
- 민감한 고객 정보 무단 접근 가능

### 필요한 기능
#### 1. 최초 관리자 등록
- 관리자가 없을 때 (첫 실행) 등록 페이지 표시
- ID/PW 입력 및 저장
- 비밀번호 해싱 (bcrypt)

#### 2. 관리자 로그인
- 로그인 폼 (ID/PW)
- JWT 토큰 기반 인증
- 세션 관리

#### 3. 인증 보호
- 모든 CRUD API 인증 필요
- 클라이언트 라우트 보호
- 자동 로그아웃 (토큰 만료)

## Requirements
### 비즈니스 요구사항
1. 오직 관리자만 예약 관리 가능
2. 최초 실행 시 관리자 계정 생성
3. 안전한 비밀번호 저장 (해싱)
4. 토큰 기반 세션 관리
5. 자동 로그아웃 기능

### 기술 요구사항
#### 백엔드 (Express.js)
- bcrypt로 비밀번호 해싱
- JWT 토큰 생성/검증
- 인증 미들웨어
- 관리자 테이블 (SQLite)

#### 프론트엔드 (React)
- 로그인 폼 컴포넌트
- 관리자 등록 폼
- 토큰 저장 (localStorage/sessionStorage)
- Protected Routes
- Axios 인터셉터 (토큰 자동 추가)

## Dependencies
### 필요한 백엔드 패키지
```bash
npm install bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken  # TypeScript 사용 시
```

### 환경변수
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

## TODO
### 우선순위: ⚡ 높음 (High)

#### Phase 1: 백엔드 인증 시스템
- [ ] 관리자 테이블 생성 (SQLite)
```sql
CREATE TABLE administrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] bcrypt와 JWT 패키지 설치
- [ ] 관리자 등록 API (`POST /api/auth/register`)
- [ ] 로그인 API (`POST /api/auth/login`)
- [ ] 토큰 검증 미들웨어
- [ ] 기존 CRUD API에 인증 미들웨어 적용

#### Phase 2: 프론트엔드 인증 컴포넌트
- [ ] 로그인 폼 컴포넌트 (`LoginForm.tsx`)
- [ ] 관리자 등록 폼 컴포넌트 (`AdminRegister.tsx`)
- [ ] 인증 컨텍스트 (`AuthContext.tsx`)
- [ ] Protected Route 컴포넌트
- [ ] Axios 인터셉터 설정

#### Phase 3: 라우팅 및 상태 관리
- [ ] React Router 설치 및 설정
- [ ] 인증 상태 관리
- [ ] 자동 로그아웃 구현
- [ ] 로그인/로그아웃 UI 업데이트

#### Phase 4: 보안 강화
- [ ] 토큰 갱신 (Refresh Token)
- [ ] 브루트포스 방지
- [ ] HTTPS 강제 (프로덕션)
- [ ] 보안 헤더 추가

#### Phase 5: 사용자 경험 개선
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 개선
- [ ] 로그인 유지 옵션
- [ ] 비밀번호 변경 기능

### 구현 예시

#### 백엔드 인증 미들웨어
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// 모든 예약 API에 적용
router.get('/reservations', authenticateToken, (req, res) => {
  // 기존 로직
});
```

#### 프론트엔드 인증 컨텍스트
```typescript
const AuthContext = createContext<{
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 예상 작업 시간
- **백엔드 인증**: 8시간
- **프론트엔드 컴포넌트**: 12시간  
- **라우팅 및 상태 관리**: 6시간
- **보안 강화**: 4시간
- **테스트 및 디버깅**: 6시간
- **총합**: 36시간 (약 1주)

### 위험 요소
- JWT 토큰 보안 관리
- 클라이언트 상태 동기화
- 토큰 만료 처리 복잡성
- 기존 코드와의 통합 이슈

## Playwright Testing
- [ ] 관리자 등록 플로우 테스트
- [ ] 로그인/로그아웃 테스트
- [ ] 인증 없이 접근 차단 테스트
- [ ] 토큰 만료 처리 테스트

## Issues Found & Resolved
발견된 문제와 해결 방법 기록