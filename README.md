# Sister Hair Salon Reservation System

헤어 살롱 예약 관리를 위한 풀스택 웹 애플리케이션입니다. React + TypeScript 프론트엔드와 Node.js + Express 백엔드로 구성되어 있습니다.

## 📋 프로젝트 개요

이 시스템은 헤어 살롱 고객들이 온라인으로 예약을 생성, 조회, 수정, 삭제할 수 있는 완전한 예약 관리 솔루션입니다. 직관적인 사용자 인터페이스와 안정적인 백엔드 API를 통해 원활한 예약 관리 경험을 제공합니다.

## 🏗 프로젝트 구조

```
sister-hair-salon-reservation/
├── salon-reservation-client/    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentForm.tsx
│   │   │   └── ReservationTable.tsx
│   │   ├── App.tsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── README.md
└── salon-reservation-server/    # Node.js 백엔드
    ├── routes/
    │   ├── reservations.js
    │   └── ...
    ├── test/
    ├── app.js
    ├── package.json
    └── README.md
```

## 🛠 기술 스택

### 프론트엔드 (Client)
- **React 19.1.0** - UI 라이브러리
- **TypeScript 4.9.5** - 정적 타입 체크
- **Tailwind CSS** - CSS 프레임워크
- **Axios** - HTTP 클라이언트
- **Create React App** - 개발 환경

### 백엔드 (Server)
- **Node.js** - 런타임 환경
- **Express.js 4.16.1** - 웹 프레임워크
- **Pug** - 템플릿 엔진
- **Morgan** - HTTP 로거
- **인메모리 데이터 저장** - 개발용 데이터 저장소

## ✨ 주요 기능

- 📅 **예약 생성**: 고객 정보, 날짜, 시간, 스타일리스트, 서비스 선택
- 📋 **예약 조회**: 모든 예약을 테이블 형태로 표시
- ✏️ **예약 수정**: 기존 예약 정보 업데이트
- 🗑️ **예약 삭제**: 불필요한 예약 제거
- 📱 **반응형 디자인**: 모바일 및 데스크탑 지원
- 🔄 **실시간 업데이트**: 즉시 반영되는 변경사항

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd sister-hair-salon-reservation
```

### 2. 백엔드 서버 설정 및 실행

```bash
cd salon-reservation-server
npm install
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

### 3. 프론트엔드 클라이언트 설정 및 실행

새 터미널 창에서:

```bash
cd salon-reservation-client
npm install
npm start
```

클라이언트는 `http://localhost:3000`에서 실행됩니다.

### 4. 애플리케이션 접속

브라우저에서 `http://localhost:3000`을 열어 애플리케이션을 사용하세요.

## 📡 API 엔드포인트

### 예약 관리 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/reservations` | 모든 예약 조회 |
| GET | `/reservations/:id` | 특정 예약 조회 |
| POST | `/reservations` | 새 예약 생성 |
| PUT | `/reservations/:id` | 예약 정보 수정 |
| DELETE | `/reservations/:id` | 예약 삭제 |

### 요청/응답 예시

**예약 생성 요청:**
```json
{
  "customerName": "김민재",
  "date": "2023-11-15",
  "time": "10:00",
  "stylist": "John",
  "serviceType": "Haircut"
}
```

**응답:**
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

### 백엔드 테스트

```bash
cd salon-reservation-server
# 서버가 실행된 상태에서
node test/testReservationGet.js
node test/testReservationPost.js
node test/testReservationPut.js
node test/testReservationDelete.js
```

### 프론트엔드 테스트

```bash
cd salon-reservation-client
npm test
```

## 📋 사용 가능한 옵션

### 스타일리스트
- John
- Sarah  
- Michael
- Emma

### 서비스 유형
- 헤어컷 (Haircut)
- 염색 (Coloring)
- 스타일링 (Styling)
- 트리트먼트 (Treatment)

## ⚠️ 알려진 이슈 및 제한사항

### 현재 문제점
1. **API 경로 불일치**: 클라이언트와 서버 간 API 경로가 일치하지 않음
2. **데이터 필드 불일치**: ID 필드 형식이 다름 (`_id` vs `id`)
3. **임시 데이터 저장**: 서버 재시작 시 데이터 손실
4. **수정 기능 미완성**: 클라이언트에서만 로컬 업데이트
5. **CORS 설정 부족**: 배포 시 문제 발생 가능

### 개발 환경 요구사항
- Node.js 16.x 이상
- npm 또는 yarn
- 모던 브라우저 (ES6+ 지원)

## 🔧 향후 개선 계획

### 긴급 수정사항
- [ ] API 경로 통일 (`/api/reservations`)
- [ ] 데이터 필드 일관성 확보
- [ ] CORS 설정 추가
- [ ] 예약 수정 기능 서버 연동

### 기능 개선
- [ ] 데이터베이스 연동 (MongoDB/PostgreSQL)
- [ ] 사용자 인증 시스템
- [ ] 예약 상태 관리
- [ ] 이메일 알림 시스템
- [ ] 캘린더 뷰
- [ ] 검색 및 필터링
- [ ] 관리자 대시보드

### 기술적 개선
- [ ] 에러 처리 강화
- [ ] 로딩 상태 관리
- [ ] 테스트 커버리지 확대
- [ ] 성능 최적화
- [ ] 접근성 개선
- [ ] PWA 지원

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 📞 연락처

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 이슈를 생성해주세요.

---

**참고**: 이 프로젝트는 학습 및 개발 목적으로 제작되었으며, 실제 운영 환경에 배포하기 전에 보안 및 성능 검토가 필요합니다.