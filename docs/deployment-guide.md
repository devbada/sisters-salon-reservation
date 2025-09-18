# 배포 및 가상 도메인 설정 가이드

## 개요
이 가이드는 Sisters Salon 예약 시스템을 외부에서 접근 가능하도록 배포하는 방법을 설명합니다.

## 가상 도메인 설정

### 1. 추천 도메인 구성
- **클라이언트**: `sisters-salon.local`
- **API 서버**: `api.sisters-salon.local`

### 2. hosts 파일 설정

#### Windows
1. 관리자 권한으로 메모장 실행
2. `C:\Windows\System32\drivers\etc\hosts` 파일 열기
3. 다음 라인 추가:
```
[서버IP] sisters-salon.local
[서버IP] api.sisters-salon.local
```

#### macOS/Linux
1. 터미널에서 다음 명령어 실행:
```bash
sudo nano /etc/hosts
```
2. 다음 라인 추가:
```
[서버IP] sisters-salon.local
[서버IP] api.sisters-salon.local
```

### 3. 서버 IP 확인 방법
```bash
# 서버에서 실행
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 환경 설정

### 클라이언트 환경변수
1. `.env.example`을 `.env`로 복사
2. `REACT_APP_API_URL` 설정:
   - 로컬 개발: `http://localhost:4000`
   - 가상 도메인: `http://api.sisters-salon.local:4000`
   - 직접 IP: `http://[서버IP]:4000`

### 자동 도메인 감지
클라이언트는 현재 접속 도메인을 기반으로 API URL을 자동 결정합니다:
- `sisters-salon.local` → `api.sisters-salon.local:4000`
- `localhost` → `localhost:4000`
- 기타 도메인 → `[현재도메인]:4000`

## 배포 단계

### 1. 서버 실행
```bash
cd salon-reservation-server
npm start
```

### 2. 클라이언트 빌드 및 실행
```bash
cd salon-reservation-client
npm run build
npx serve -s build -l 3000
```

### 3. 접속 확인
- 클라이언트: `http://sisters-salon.local:3000`
- API 테스트: `http://api.sisters-salon.local:4000/api/appointments`

## 트러블슈팅

### CORS 오류 발생시
서버의 CORS 설정이 가상 도메인을 허용하는지 확인:
```javascript
// salon-reservation-server/app.js
app.use(cors({
  origin: ['http://sisters-salon.local:3000', 'http://localhost:3000']
}));
```

### 도메인 접근 불가시
1. hosts 파일 설정 확인
2. 서버 방화벽 설정 확인
3. 네트워크 연결 상태 확인

## 보안 고려사항

### HTTPS 설정 (선택사항)
프로덕션 환경에서는 SSL 인증서 설정을 권장합니다:
1. Let's Encrypt 또는 자체 서명 인증서 생성
2. Nginx/Apache 리버스 프록시 설정
3. HTTPS 리다이렉트 설정