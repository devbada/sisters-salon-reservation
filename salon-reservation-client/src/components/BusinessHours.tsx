import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BusinessHour {
  id?: number;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

interface Holiday {
  id?: number;
  date: string;
  name: string;
  is_recurring: boolean;
}

interface SpecialHour {
  id?: number;
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

const BusinessHoursManagement: React.FC = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // 초기 데이터 로드
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [hoursRes, holidaysRes, specialRes] = await Promise.all([
        axios.get('http://localhost:4000/api/business-hours', { headers }),
        axios.get('http://localhost:4000/api/business-hours/holidays', { headers }),
        axios.get('http://localhost:4000/api/business-hours/special', { headers })
      ]);

      setBusinessHours(hoursRes.data);
      setHolidays(holidaysRes.data);
      setSpecialHours(specialRes.data);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Failed to fetch business hours data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHour = async (dayOfWeek: number, updates: Partial<BusinessHour>) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/business-hours/${dayOfWeek}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 상태 업데이트
      setBusinessHours(prev => 
        prev.map(hour => 
          hour.day_of_week === dayOfWeek 
            ? { ...hour, ...updates }
            : hour
        )
      );
    } catch (err) {
      console.error('Failed to update business hour:', err);
      setError('영업시간 업데이트에 실패했습니다.');
    }
  };

  const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/business-hours/holidays',
        holiday,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHolidays(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to add holiday:', err);
      setError('휴일 추가에 실패했습니다.');
    }
  };

  const deleteHoliday = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:4000/api/business-hours/holidays/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
    } catch (err) {
      console.error('Failed to delete holiday:', err);
      setError('휴일 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass-card p-4 bg-red-100 border border-red-400 text-red-700">
          ⚠️ {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 기본 영업시간 설정 */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🕐 기본 영업시간
        </h2>
        
        <div className="space-y-4">
          {businessHours.map((hour) => (
            <BusinessHourRow
              key={hour.day_of_week}
              hour={hour}
              dayName={dayNames[hour.day_of_week]}
              onUpdate={(updates) => updateBusinessHour(hour.day_of_week, updates)}
            />
          ))}
        </div>
      </div>

      {/* 휴일 관리 */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🏖️ 휴일 관리
        </h2>
        
        <HolidayManager
          holidays={holidays}
          onAddHoliday={addHoliday}
          onDeleteHoliday={deleteHoliday}
        />
      </div>

      {/* 특별 영업시간 */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ⭐ 특별 영업시간
        </h2>
        
        <SpecialHoursManager
          specialHours={specialHours}
          onRefresh={fetchAllData}
        />
      </div>
    </div>
  );
};

// 개별 영업시간 행 컴포넌트
interface BusinessHourRowProps {
  hour: BusinessHour;
  dayName: string;
  onUpdate: (updates: Partial<BusinessHour>) => void;
}

const BusinessHourRow: React.FC<BusinessHourRowProps> = ({ hour, dayName, onUpdate }) => {
  const handleToggleClosed = () => {
    onUpdate({ is_closed: !hour.is_closed });
  };

  const handleTimeChange = (field: keyof BusinessHour, value: string) => {
    onUpdate({ [field]: value || null });
  };

  return (
    <div className="flex items-center space-x-4 p-4 glass-input rounded-lg">
      <div className="w-20 font-medium text-gray-800">
        {dayName}
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={hour.is_closed}
          onChange={handleToggleClosed}
          className="w-4 h-4"
        />
        <label className="text-sm text-gray-600">휴무</label>
      </div>
      
      {!hour.is_closed && (
        <>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">오픈:</label>
            <input
              type="time"
              value={hour.open_time || ''}
              onChange={(e) => handleTimeChange('open_time', e.target.value)}
              className="glass-input px-2 py-1 text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">마감:</label>
            <input
              type="time"
              value={hour.close_time || ''}
              onChange={(e) => handleTimeChange('close_time', e.target.value)}
              className="glass-input px-2 py-1 text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">휴게시간:</label>
            <input
              type="time"
              value={hour.break_start || ''}
              onChange={(e) => handleTimeChange('break_start', e.target.value)}
              className="glass-input px-2 py-1 text-sm"
              placeholder="시작"
            />
            <span className="text-gray-500">~</span>
            <input
              type="time"
              value={hour.break_end || ''}
              onChange={(e) => handleTimeChange('break_end', e.target.value)}
              className="glass-input px-2 py-1 text-sm"
              placeholder="끝"
            />
          </div>
        </>
      )}
    </div>
  );
};

// 휴일 관리 컴포넌트
interface HolidayManagerProps {
  holidays: Holiday[];
  onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  onDeleteHoliday: (id: number) => void;
}

const HolidayManager: React.FC<HolidayManagerProps> = ({ holidays, onAddHoliday, onDeleteHoliday }) => {
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    is_recurring: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHoliday.date && newHoliday.name) {
      onAddHoliday(newHoliday);
      setNewHoliday({ date: '', name: '', is_recurring: false });
    }
  };

  return (
    <div className="space-y-4">
      {/* 휴일 추가 폼 */}
      <form onSubmit={handleSubmit} className="glass-input p-4 rounded-lg space-y-3">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">날짜</label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
              className="glass-input px-3 py-2"
              required
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">휴일명</label>
            <input
              type="text"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
              className="glass-input px-3 py-2 w-full"
              placeholder="예: 신정, 추석 등"
              required
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newHoliday.is_recurring}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, is_recurring: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">매년 반복</span>
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              ➕ 추가
            </button>
          </div>
        </div>
      </form>

      {/* 휴일 목록 */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {holidays.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 휴일이 없습니다.</p>
        ) : (
          holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between p-3 glass-input rounded-lg"
            >
              <div>
                <span className="font-medium text-gray-800">{holiday.name}</span>
                <span className="text-gray-500 ml-2">{holiday.date}</span>
                {holiday.is_recurring && (
                  <span className="text-blue-600 text-xs ml-2">🔄 매년반복</span>
                )}
              </div>
              <button
                onClick={() => holiday.id && onDeleteHoliday(holiday.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 특별 영업시간 관리 컴포넌트
interface SpecialHoursManagerProps {
  specialHours: SpecialHour[];
  onRefresh: () => void;
}

const SpecialHoursManager: React.FC<SpecialHoursManagerProps> = ({ specialHours, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpecialHour, setNewSpecialHour] = useState({
    date: '',
    open_time: '',
    close_time: '',
    is_closed: false,
    break_start: '',
    break_end: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/api/business-hours/special',
        {
          ...newSpecialHour,
          open_time: newSpecialHour.open_time || null,
          close_time: newSpecialHour.close_time || null,
          break_start: newSpecialHour.break_start || null,
          break_end: newSpecialHour.break_end || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewSpecialHour({
        date: '',
        open_time: '',
        close_time: '',
        is_closed: false,
        break_start: '',
        break_end: ''
      });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to add special hour:', err);
    }
  };

  const deleteSpecialHour = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:4000/api/business-hours/special/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (err) {
      console.error('Failed to delete special hour:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">특정 날짜의 영업시간을 별도로 설정할 수 있습니다.</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
        >
          {showAddForm ? '❌ 취소' : '➕ 특별시간 추가'}
        </button>
      </div>

      {/* 특별시간 추가 폼 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-input p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">날짜</label>
              <input
                type="date"
                value={newSpecialHour.date}
                onChange={(e) => setNewSpecialHour(prev => ({ ...prev, date: e.target.value }))}
                className="glass-input px-3 py-2 w-full"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newSpecialHour.is_closed}
                  onChange={(e) => setNewSpecialHour(prev => ({ ...prev, is_closed: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">이 날 휴무</span>
              </label>
            </div>

            {!newSpecialHour.is_closed && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">오픈시간</label>
                  <input
                    type="time"
                    value={newSpecialHour.open_time}
                    onChange={(e) => setNewSpecialHour(prev => ({ ...prev, open_time: e.target.value }))}
                    className="glass-input px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">마감시간</label>
                  <input
                    type="time"
                    value={newSpecialHour.close_time}
                    onChange={(e) => setNewSpecialHour(prev => ({ ...prev, close_time: e.target.value }))}
                    className="glass-input px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">휴게시간 시작</label>
                  <input
                    type="time"
                    value={newSpecialHour.break_start}
                    onChange={(e) => setNewSpecialHour(prev => ({ ...prev, break_start: e.target.value }))}
                    className="glass-input px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">휴게시간 끝</label>
                  <input
                    type="time"
                    value={newSpecialHour.break_end}
                    onChange={(e) => setNewSpecialHour(prev => ({ ...prev, break_end: e.target.value }))}
                    className="glass-input px-3 py-2 w-full"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              ✨ 저장
            </button>
          </div>
        </form>
      )}

      {/* 특별시간 목록 */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {specialHours.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 특별 영업시간이 없습니다.</p>
        ) : (
          specialHours.map((special) => (
            <div
              key={special.id}
              className="flex items-center justify-between p-3 glass-input rounded-lg"
            >
              <div>
                <span className="font-medium text-gray-800">{special.date}</span>
                {special.is_closed ? (
                  <span className="text-red-600 ml-2">🚫 휴무</span>
                ) : (
                  <span className="text-gray-600 ml-2">
                    🕐 {special.open_time || '미설정'} ~ {special.close_time || '미설정'}
                    {special.break_start && special.break_end && (
                      <span className="text-sm"> (휴게: {special.break_start}~{special.break_end})</span>
                    )}
                  </span>
                )}
              </div>
              <button
                onClick={() => special.id && deleteSpecialHour(special.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BusinessHoursManagement;