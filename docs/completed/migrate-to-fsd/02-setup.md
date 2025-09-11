# 기본 폴더 구조 설정

## 브랜치 전략 및 개발 가이드

### 새 브랜치 생성
FSD 마이그레이션 작업을 위한 전용 브랜치를 생성합니다:

```bash
# 현재 브랜치 확인
git status

# 메인 브랜치에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/migrate-to-fsd

# 브랜치 푸시
git push -u origin feature/migrate-to-fsd
```

### 개발 가이드 준수 사항
1. **커밋 단위**: 각 마이그레이션 단계별로 의미있는 커밋 생성
2. **테스트 검증**: 각 단계 완료 후 기능 테스트 수행
3. **점진적 마이그레이션**: 전체 구조를 한번에 변경하지 않고 단계적 접근
4. **백업**: 기존 코드 백업 및 복구 계획 수립

## FSD 폴더 구조 생성

### 1단계: 기본 FSD 디렉터리 생성

```bash
cd salon-reservation-client/src

# FSD 기본 계층 구조 생성
mkdir -p app/{providers,styles}
mkdir -p pages/{reservations,customers,designers,business-hours,statistics}
mkdir -p widgets/{header,calendar,reservation-table,customer-list,designer-table,statistics-dashboard}
mkdir -p features/{authentication,reservation-management,customer-management,designer-management,business-hours}
mkdir -p entities/{reservation,customer,designer,business-hours}
mkdir -p shared/{ui,lib,api,config,constants}

# 각 계층의 세그먼트 디렉터리 생성
mkdir -p shared/ui/{button,input,modal,badge,table,card}
mkdir -p shared/lib/{hooks,utils,types}
mkdir -p shared/api/{base,types}
mkdir -p shared/config/{constants,env}

# 각 엔티티의 세그먼트 생성
mkdir -p entities/reservation/{model,api,lib}
mkdir -p entities/customer/{model,api,lib}
mkdir -p entities/designer/{model,api,lib}
mkdir -p entities/business-hours/{model,api,lib}

# 각 기능의 세그먼트 생성
mkdir -p features/authentication/{ui,model,api}
mkdir -p features/reservation-management/{ui,model,api}
mkdir -p features/customer-management/{ui,model,api}
mkdir -p features/designer-management/{ui,model,api}
mkdir -p features/business-hours/{ui,model,api}

# 각 위젯의 세그먼트 생성
mkdir -p widgets/header/{ui,model}
mkdir -p widgets/calendar/{ui,model}
mkdir -p widgets/reservation-table/{ui,model}
mkdir -p widgets/customer-list/{ui,model}
mkdir -p widgets/designer-table/{ui,model}
mkdir -p widgets/statistics-dashboard/{ui,model}
```

### 2단계: 기본 index 파일 생성

각 디렉터리에 기본 index.ts 파일을 생성하여 Public API를 정의합니다:

#### Shared 계층 index 파일들

**shared/ui/index.ts**
```typescript
// 모든 공용 UI 컴포넌트를 여기서 export
export { Button } from './button';
export { Input } from './input';
export { Modal } from './modal';
export { Badge } from './badge';
export { Table } from './table';
export { Card } from './card';
```

**shared/lib/index.ts**
```typescript
// 모든 공용 라이브러리를 여기서 export
export * from './hooks';
export * from './utils';
export * from './types';
```

**shared/api/index.ts**
```typescript
// API 관련 공용 코드
export * from './base';
export * from './types';
```

#### Entities 계층 index 파일들

**entities/reservation/index.ts**
```typescript
export * from './model';
export * from './api';
export * from './lib';
```

#### Features 계층 index 파일들

**features/authentication/index.ts**
```typescript
export { LoginForm } from './ui/LoginForm';
export { AdminRegister } from './ui/AdminRegister';
// 기타 authentication 관련 export
```

### 3단계: TypeScript 경로 설정

**tsconfig.json 업데이트**
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "~/*": ["*"],
      "~/app/*": ["app/*"],
      "~/pages/*": ["pages/*"],
      "~/widgets/*": ["widgets/*"],
      "~/features/*": ["features/*"],
      "~/entities/*": ["entities/*"],
      "~/shared/*": ["shared/*"]
    }
  }
}
```

### 4단계: ESLint 규칙 설정 (선택사항)

FSD 의존성 규칙을 강제하는 ESLint 설정을 추가할 수 있습니다:

**package.json에 의존성 추가**
```bash
npm install --save-dev eslint-plugin-import eslint-import-resolver-typescript
```

**.eslintrc.js 규칙 추가**
```javascript
module.exports = {
  extends: [
    // 기존 설정...
  ],
  rules: {
    // FSD 의존성 규칙 (예시)
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/shared',
            from: './src',
            except: ['./shared'],
            message: 'Shared layer should not import from upper layers'
          },
          {
            target: './src/entities',
            from: './src',
            except: ['./entities', './shared'],
            message: 'Entities layer should only import from shared layer'
          }
          // 추가 규칙...
        ]
      }
    ]
  }
};
```

## 마이그레이션 체크리스트

### 폴더 구조 생성
- [ ] FSD 기본 계층 디렉터리 생성
- [ ] 각 계층의 세그먼트 디렉터리 생성  
- [ ] 기본 index.ts 파일 생성
- [ ] TypeScript 경로 설정 업데이트
- [ ] ESLint 규칙 설정 (선택사항)

### 브랜치 및 개발 설정
- [ ] 새 브랜치 생성 (`feature/migrate-to-fsd`)
- [ ] 기본 구조 설정 커밋
- [ ] 팀원들과 마이그레이션 계획 공유

### 검증
- [ ] TypeScript 컴파일 에러 없음
- [ ] 기존 애플리케이션 정상 작동
- [ ] 새 폴더 구조 생성 완료

## 주의사항

### 기존 코드 유지
- 마이그레이션 중에는 기존 코드를 유지하면서 새 구조를 병렬로 생성
- 각 단계별 완료 후 기존 코드 제거

### 점진적 접근
- 한 번에 모든 파일을 이동하지 않음
- Shared 계층부터 시작하여 상위 계층으로 점진적 마이그레이션

### 테스트 전략
- 각 마이그레이션 단계 후 기능 테스트 수행
- 자동화된 테스트가 있다면 활용

## 다음 단계

폴더 구조 생성이 완료되면 다음 순서로 마이그레이션을 진행합니다:

1. **Shared 계층** - 공통 코드 마이그레이션
2. **Entities 계층** - 비즈니스 엔티티 분리
3. **Features 계층** - 비즈니스 기능 모듈화
4. **Widgets 계층** - 복합 UI 블록 구성
5. **Pages 계층** - 페이지 컴포넌트 구성
6. **App 계층** - 애플리케이션 초기화

---

**다음 단계**: `03-shared-layer.md`에서 Shared 계층 마이그레이션 진행