import axios from 'axios';

function getAPIBaseURL(): string {
  const hostname = window.location.hostname;

  // 가상 도메인 사용시 자동 매핑
  if (hostname === 'sisters-salon.local') {
    return 'http://api.sisters-salon.local:4000';
  }

  // localhost 접속시
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }

  // 환경변수가 설정되어 있으면 사용
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 기타 IP 접속시 같은 호스트의 4000 포트 사용
  return `http://${hostname}:4000`;
}

const API_BASE_URL = getAPIBaseURL();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);