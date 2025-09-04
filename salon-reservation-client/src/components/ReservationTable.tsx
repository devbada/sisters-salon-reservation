import React from 'react';
import { AppointmentData } from './AppointmentForm';

interface ReservationTableProps {
  reservations: AppointmentData[];
  onEdit: (reservation: AppointmentData, index: number) => void;
  onDelete: (index: number) => void;
}

const ReservationTable: React.FC<ReservationTableProps> = ({ 
  reservations, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg reservation-table backdrop-blur-sm bg-opacity-95">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">예약 목록</h2>

      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">예약이 없습니다.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200" role="table" aria-label="예약 목록 테이블">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">고객 이름</th>
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">날짜</th>
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">시간</th>
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">스타일리스트</th>
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">서비스</th>
                  <th className="py-3 px-4 border-b text-left font-semibold" scope="col">작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation, index) => (
                  <tr key={reservation._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 border-b font-medium">{reservation.customerName}</td>
                    <td className="py-3 px-4 border-b">{reservation.date}</td>
                    <td className="py-3 px-4 border-b">{reservation.time}</td>
                    <td className="py-3 px-4 border-b">{reservation.stylist}</td>
                    <td className="py-3 px-4 border-b">{reservation.serviceType}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(reservation, index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          aria-label={`${reservation.customerName}의 예약 수정`}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => onDelete(index)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          aria-label={`${reservation.customerName}의 예약 삭제`}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {reservations.map((reservation, index) => (
              <div
                key={reservation._id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{reservation.customerName}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(reservation, index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      aria-label={`${reservation.customerName}의 예약 수정`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      aria-label={`${reservation.customerName}의 예약 삭제`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">날짜</span>
                    <span className="font-medium">{reservation.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">시간</span>
                    <span className="font-medium">{reservation.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">스타일리스트</span>
                    <span className="font-medium">{reservation.stylist}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">서비스</span>
                    <span className="font-medium">{reservation.serviceType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationTable;
