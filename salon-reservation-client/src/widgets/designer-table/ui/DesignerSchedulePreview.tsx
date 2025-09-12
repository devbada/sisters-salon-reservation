import React from 'react';
import type { Designer } from '~/entities/designer';
import type { Reservation } from '~/entities/reservation';

interface DesignerSchedulePreviewProps {
  designer: Designer;
  todayReservations?: Reservation[];
}

export const DesignerSchedulePreview: React.FC<DesignerSchedulePreviewProps> = ({
  designer,
  todayReservations = [],
}) => {
  const designerReservations = todayReservations.filter(
    reservation => reservation.designerName === designer.name
  );

  const getNextAppointment = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const upcoming = designerReservations
      .filter(reservation => reservation.time > currentTime)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    return upcoming[0];
  };

  const nextAppointment = getNextAppointment();

  return (
    <div className="mt-2 p-3 bg-white/10 rounded-lg">
      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
        📅 오늘 일정 미리보기
      </h4>
      
      {designerReservations.length === 0 ? (
        <p className="text-sm text-gray-500">오늘 예약이 없습니다</p>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            총 {designerReservations.length}건의 예약
          </div>
          
          {nextAppointment && (
            <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
              <div className="text-sm">
                <span className="font-medium text-blue-800">다음 예약:</span>
                <div className="mt-1">
                  <span className="text-blue-700">
                    {nextAppointment.time} - {nextAppointment.customerName}
                  </span>
                  <div className="text-xs text-blue-600">
                    {nextAppointment.service}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            일정 상세보기는 예약 관리 탭에서 확인하세요
          </div>
        </div>
      )}
    </div>
  );
};