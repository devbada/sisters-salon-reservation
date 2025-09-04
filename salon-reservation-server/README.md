# Hair Salon Reservation Server

Node.js Express 서버로 구현된 헤어 살롱 예약 시스템의 백엔드입니다.

## 📋 개요

이 서버는 헤어 살롱 예약 관리를 위한 REST API를 제공합니다. 고객의 예약 생성, 조회, 수정, 삭제 기능을 지원하며, 인메모리 데이터 저장 방식을 사용합니다.

## 🛠 기술 스택

- **Node.js** - 런타임 환경
- **Express.js 4.16.1** - 웹 프레임워크
- **Pug 2.0.0-beta11** - 템플릿 엔진
- **Morgan** - HTTP 요청 로거
- **Cookie Parser** - 쿠키 파싱
- **Webpack 5.89.0** - 모듈 번들러

## 📁 프로젝트 구조

```
salon-reservation-server/
├── app.js              # Express 애플리케이션 메인 파일
├── bin/               # 서버 시작 스크립트
├── routes/            # API 라우터 파일들
│   ├── index.js       # 메인 라우터
│   ├── reservations.js # 예약 관련 API
│   └── users.js       # 사용자 관련 API
├── views/             # Pug 템플릿 파일들
├── public/            # 정적 파일들
├── test/              # 테스트 파일들
└── webpack.config.js  # Webpack 설정
```

## 🚀 시작하기

### 설치

```bash
cd salon-reservation-server
npm install
```

### 개발 서버 실행

```bash
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 감시 모드 빌드

```bash
npm run watch
```

## 📡 API 엔드포인트

### 예약 관리

- `GET /reservations` - 모든 예약 조회
- `GET /reservations/:id` - 특정 예약 조회
- `POST /reservations` - 새 예약 생성
- `PUT /reservations/:id` - 예약 수정
- `DELETE /reservations/:id` - 예약 삭제

### 요청 데이터 형식

```json
{
  "customerName": "김민재",
  "date": "2023-11-15",
  "time": "10:00",
  "stylist": "John",
  "serviceType": "Haircut"
}
```

### 응답 데이터 형식

```json
{
  "id": 1,
  "customerName": "김민재",
  "date": "2023-11-15", 
  "time": "10:00",
  "stylist": "John",
  "serviceType": "Haircut",
  "createdAt": "2023-11-15T02:00:00.000Z"
}
```

## 🧪 테스트

테스트 파일들이 `test/` 디렉토리에 포함되어 있습니다:

- `testReservationGet.js` - GET API 테스트
- `testReservationPost.js` - POST API 테스트
- `testReservationPut.js` - PUT API 테스트
- `testReservationDelete.js` - DELETE API 테스트
- `testUsers.js` - 사용자 API 테스트
- `testHomePage.js` - 홈페이지 테스트

### 테스트 실행

```bash
# 서버가 실행된 상태에서
node test/testReservationGet.js
node test/testReservationPost.js
# ... 다른 테스트 파일들
```

## ⚠️ 알려진 문제점

1. **데이터 저장**: 현재 인메모리 저장을 사용하므로 서버 재시작 시 데이터가 손실됩니다.
2. **CORS 설정**: CORS 헤더가 설정되지 않아 클라이언트와의 통신에 문제가 있을 수 있습니다.
3. **API 경로**: 클라이언트에서 `/api/reservations` 경로를 호출하지만 서버는 `/reservations`로 설정되어 있습니다.

## 🔧 개선 계획

- [ ] 데이터베이스 연동 (MongoDB/PostgreSQL)
- [ ] CORS 설정 추가
- [ ] API 경로 일관성 개선
- [ ] 입력 데이터 검증 강화
- [ ] 에러 처리 개선
- [ ] 로깅 시스템 구축

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.