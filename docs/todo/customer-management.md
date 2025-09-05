# 👥 고객 관리 시스템

**작성일**: 2025-01-04  
**상태**: 📋 계획 중  
**우선순위**: ⭐⭐⭐⭐ (높음)  
**예상 소요 시간**: 5-6시간

## 📋 개요

고객 정보를 체계적으로 관리하고, 방문 이력을 추적하며, 개인화된 서비스를 제공할 수 있는 고객 관리 시스템(CRM)을 구현합니다.

## 🎯 목표

- 고객 프로필 관리
- 방문 이력 및 서비스 내역 추적
- 선호 스타일리스트 및 서비스 기록
- VIP 고객 관리
- 고객별 메모 및 특이사항 기록

## 🛠 기술 스택

- **데이터베이스**: SQLite (customers 테이블 추가)
- **백엔드**: Express.js REST API
- **프론트엔드**: React + TypeScript
- **상태 관리**: Context API 또는 Zustand
- **폼 처리**: React Hook Form

## ✅ 구현 작업 목록

### 1. 데이터베이스 설계
- [ ] customers 테이블 생성
- [ ] 고객-예약 관계 설정 (1:N)
- [ ] 인덱스 최적화
- [ ] 마이그레이션 스크립트 작성

### 2. 백엔드 API 개발
- [ ] `POST /api/customers` 고객 등록
- [ ] `GET /api/customers` 고객 목록 조회
- [ ] `GET /api/customers/:id` 고객 상세 조회
- [ ] `PUT /api/customers/:id` 고객 정보 수정
- [ ] `DELETE /api/customers/:id` 고객 삭제
- [ ] `GET /api/customers/:id/history` 방문 이력 조회

### 3. 고객 프로필 컴포넌트
- [ ] `CustomerProfile.tsx` 프로필 상세 화면
- [ ] `CustomerForm.tsx` 등록/수정 폼
- [ ] `CustomerList.tsx` 고객 목록
- [ ] `CustomerCard.tsx` 고객 카드 컴포넌트

### 4. 고객 정보 필드
- [ ] 기본 정보 (이름, 연락처, 이메일)
- [ ] 생년월일 및 성별
- [ ] 선호 스타일리스트
- [ ] 선호 서비스 종류
- [ ] 알러지 정보
- [ ] VIP 여부 및 등급
- [ ] 가입일 및 최근 방문일

### 5. 방문 이력 기능
- [ ] 방문 날짜 및 시간
- [ ] 이용한 서비스
- [ ] 담당 스타일리스트
- [ ] 서비스 금액 (선택사항)
- [ ] 방문 횟수 자동 계산
- [ ] 최근 방문 트렌드 분석

### 6. 고객 메모 시스템
- [ ] 메모 작성/수정/삭제
- [ ] 메모 작성일시 및 작성자
- [ ] 중요 메모 플래그
- [ ] 메모 히스토리 관리

### 7. 검색 및 필터링
- [ ] 이름/전화번호로 검색
- [ ] VIP 고객 필터
- [ ] 최근 방문 기준 정렬
- [ ] 방문 횟수 기준 정렬
- [ ] 생일자 필터 (이번 달)

### 8. 알림 및 마케팅
- [ ] 생일 알림
- [ ] 장기 미방문 고객 알림
- [ ] VIP 고객 특별 관리
- [ ] 프로모션 대상 선정

### 9. 통합 및 연동
- [ ] 예약 시스템과 연동
- [ ] 예약 시 고객 자동 조회
- [ ] 신규 고객 자동 등록 옵션
- [ ] 고객 정보 자동 완성

## 📝 구현 세부사항

### 데이터베이스 스키마
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  birthdate DATE,
  gender VARCHAR(10),
  preferred_stylist VARCHAR(100),
  preferred_service VARCHAR(200),
  allergies TEXT,
  vip_status BOOLEAN DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  last_visit_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  note TEXT NOT NULL,
  is_important BOOLEAN DEFAULT 0,
  created_by VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### TypeScript 인터페이스
```typescript
interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  gender?: 'male' | 'female' | 'other';
  preferredStylist?: string;
  preferredService?: string;
  allergies?: string;
  vipStatus: boolean;
  vipLevel: number;
  totalVisits: number;
  lastVisitDate?: string;
  notes?: CustomerNote[];
}

interface CustomerNote {
  id: number;
  customerId: number;
  note: string;
  isImportant: boolean;
  createdBy: string;
  createdAt: string;
}
```

## 🎨 디자인 가이드라인

### 고객 카드 디자인
- VIP 고객: 골드 그라데이션 테두리
- 일반 고객: 기본 glassmorphism
- 생일자: 생일 케이크 아이콘 표시
- 장기 미방문: 주의 표시

### 레이아웃
- 고객 목록: 그리드 또는 테이블 뷰 전환
- 프로필 상세: 2-column 레이아웃
- 방문 이력: 타임라인 형식

## 📊 예상 결과

- 고객 재방문율 20% 향상
- 개인화 서비스로 고객 만족도 증가
- VIP 고객 관리 체계화
- 마케팅 타겟팅 정확도 향상

## 🚨 주의사항

1. **개인정보보호**: GDPR/개인정보보호법 준수
2. **데이터 보안**: 고객 정보 암호화
3. **백업**: 정기적인 고객 데이터 백업
4. **권한 관리**: 직원별 접근 권한 설정

## 🔗 참고 자료

- [CRM 베스트 프랙티스](https://www.salesforce.com/resources/articles/crm-best-practices/)
- [개인정보보호법 가이드](https://www.privacy.kisa.or.kr/)
- [SQLite 관계형 데이터베이스](https://www.sqlite.org/foreignkeys.html)