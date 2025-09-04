import React, { useState } from 'react';
import axios from 'axios';

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    time: '',
    stylist: '',
    serviceType: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/reservations', formData);
      setMessage('예약이 성공적으로 생성되었습니다!');
      setFormData({
        customerName: '',
        date: '',
        time: '',
        stylist: '',
        serviceType: ''
      });
      console.log('Reservation created:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || '예약 생성 중 오류가 발생했습니다.');
      console.error('Error creating reservation:', err);
    }
  };

  return (
    <div className="reservation-form">
      <h2>미용실 예약하기</h2>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">이름</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">날짜</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">시간</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stylist">스타일리스트</label>
          <select
            id="stylist"
            name="stylist"
            value={formData.stylist}
            onChange={handleChange}
            required
          >
            <option value="">스타일리스트 선택</option>
            <option value="John">John</option>
            <option value="Sarah">Sarah</option>
            <option value="Michael">Michael</option>
            <option value="Emily">Emily</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serviceType">서비스 유형</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="">서비스 선택</option>
            <option value="Haircut">헤어컷</option>
            <option value="Color">염색</option>
            <option value="Styling">스타일링</option>
            <option value="Treatment">트리트먼트</option>
          </select>
        </div>

        <button type="submit" className="submit-button">예약하기</button>
      </form>
    </div>
  );
};

export default ReservationForm;
