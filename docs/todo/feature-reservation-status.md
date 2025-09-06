# 📋 예약 상태 관리 시스템

**Priority**: 🔥 High  
**Phase**: 2 (비즈니스 로직)  
**Estimated Time**: 8-12 hours  

## 📋 현재 상황

### 기존 예약 시스템
- 예약 생성 후 상태 변경 불가
- 예약 완료/취소/노쇼 구분 없음
- 비즈니스 프로세스 추적 어려움

## ✅ 목표 기능

### 예약 상태 분류
- **대기 (pending)**: 예약 요청 상태
- **확정 (confirmed)**: 예약 확정 상태  
- **완료 (completed)**: 서비스 완료
- **취소 (cancelled)**: 고객/관리자 취소
- **노쇼 (no_show)**: 무단 불참

## 🔧 구현 방안

### 1. 데이터베이스 스키마 수정

```sql
-- 예약 상태 컬럼 추가
ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE reservations ADD COLUMN status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reservations ADD COLUMN status_updated_by TEXT;
ALTER TABLE reservations ADD COLUMN notes TEXT;

-- 예약 상태 히스토리 테이블 생성
CREATE TABLE reservation_status_history (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  FOREIGN KEY (reservation_id) REFERENCES reservations(_id)
);

-- 인덱스 추가
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_status_date ON reservations(status, date);
CREATE INDEX idx_status_history_reservation ON reservation_status_history(reservation_id);
```

### 2. 백엔드 API 확장

```javascript
// routes/reservations.js - 상태 변경 API

// 예약 상태 변경
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, notes } = req.body;
    const adminId = req.user.id;
    
    // 유효한 상태 값 검증
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
    }
    
    // 기존 예약 조회
    const reservation = db.prepare('SELECT * FROM reservations WHERE _id = ?').get(id);
    if (!reservation) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    // 상태 변경 로직 검증
    const canTransition = validateStatusTransition(reservation.status, status);
    if (!canTransition) {
      return res.status(400).json({ 
        error: `${reservation.status}에서 ${status}로 변경할 수 없습니다.` 
      });
    }
    
    // 트랜잭션으로 상태 변경 + 히스토리 기록
    const transaction = db.transaction(() => {
      // 예약 상태 업데이트
      db.prepare(`
        UPDATE reservations 
        SET status = ?, status_updated_at = CURRENT_TIMESTAMP, 
            status_updated_by = ?, notes = ?
        WHERE _id = ?
      `).run(status, adminId, notes || null, id);
      
      // 히스토리 기록
      db.prepare(`
        INSERT INTO reservation_status_history 
        (id, reservation_id, old_status, new_status, changed_by, reason)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        generateId(),
        id, 
        reservation.status, 
        status, 
        adminId, 
        reason || null
      );
    });
    
    transaction();
    
    // 업데이트된 예약 정보 반환
    const updatedReservation = db.prepare('SELECT * FROM reservations WHERE _id = ?').get(id);
    res.json({ 
      message: '예약 상태가 변경되었습니다.',
      reservation: updatedReservation 
    });
    
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: '상태 변경 중 오류가 발생했습니다.' });
  }
});

// 상태 변경 규칙 검증
function validateStatusTransition(currentStatus, newStatus) {
  const transitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled', 'no_show'],
    'completed': [], // 완료된 예약은 변경 불가
    'cancelled': [], // 취소된 예약은 변경 불가
    'no_show': ['completed'] // 노쇼 후 뒤늦게 완료 처리 가능
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
}
```

### 3. 프론트엔드 상태 관리 UI

```typescript
// components/ReservationStatusBadge.tsx
interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
}

const ReservationStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { label: '대기', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    confirmed: { label: '확정', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: '🎉' },
    cancelled: { label: '취소', color: 'bg-red-100 text-red-800', icon: '❌' },
    no_show: { label: '노쇼', color: 'bg-gray-100 text-gray-800', icon: '👻' }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};
```

```typescript
// components/ReservationStatusModal.tsx
interface StatusModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (reservationId: string, newStatus: string, reason?: string) => void;
}

const ReservationStatusModal: React.FC<StatusModalProps> = ({
  reservation, isOpen, onClose, onStatusChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState(reservation.status);
  const [reason, setReason] = useState('');
  
  const availableTransitions = getAvailableTransitions(reservation.status);
  
  const handleSubmit = () => {
    if (selectedStatus !== reservation.status) {
      onStatusChange(reservation._id, selectedStatus, reason);
    }
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {reservation.customerName}님 예약 상태 변경
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">현재 상태</label>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">변경할 상태</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value={reservation.status}>현재 상태 유지</option>
            {availableTransitions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">변경 사유</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="상태 변경 이유를 입력하세요..."
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={selectedStatus === reservation.status}
          >
            상태 변경
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

## 🔧 구현 단계

### Step 1: 데이터베이스 스키마 확장
- [ ] reservations 테이블에 status 컬럼 추가
- [ ] reservation_status_history 테이블 생성
- [ ] 필요한 인덱스 추가
- [ ] 기존 데이터 마이그레이션 (모든 예약을 'pending'으로 설정)

### Step 2: 백엔드 API 개발
- [ ] 예약 상태 변경 API 개발
- [ ] 상태 전환 규칙 검증 로직
- [ ] 히스토리 추적 시스템
- [ ] 예약 목록 조회에 상태 필터 추가

### Step 3: 프론트엔드 UI 개발
- [ ] 상태 배지 컴포넌트
- [ ] 상태 변경 모달
- [ ] 예약 테이블에 상태 컬럼 추가
- [ ] 상태별 필터링 기능

### Step 4: 비즈니스 로직 확장
- [ ] 자동 상태 변경 (예: 예약 시간 지나면 no_show)
- [ ] 상태별 알림 시스템
- [ ] 통계 대시보드에 상태별 집계

## 📊 완료 기준

### 필수 요구사항
- ✅ 5가지 예약 상태 구분 가능
- ✅ 관리자가 상태 변경 가능
- ✅ 상태 변경 히스토리 추적
- ✅ 불가능한 상태 변경 차단

### 사용성 체크리스트
- [ ] 직관적인 상태 배지 색상
- [ ] 간편한 상태 변경 UI
- [ ] 상태별 예약 필터링
- [ ] 상태 변경 사유 기록

## 🔄 후속 작업

1. **자동 상태 관리** → `todo/feature-auto-status.md`
2. **상태별 알림** → `todo/feature-status-notifications.md`
3. **고급 통계** → `todo/analytics-status-reports.md`

---

**Created**: 2025-09-06  
**Status**: 📋 Ready to Start  
**Dependencies**: JWT 보안 강화 완료  
**Assignee**: TBD