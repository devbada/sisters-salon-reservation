// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Node.js 환경을 위한 polyfills
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// MSW는 일단 주석 처리하고 기본 테스트만 실행
// import { setupServer } from 'msw/node';
// import { handlers } from './shared/api/mocks/handlers';

// MSW 서버 설정
// export const server = setupServer(...handlers);

// 테스트 시작 전 MSW 서버 시작
// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'warn'
//   });
// });

// 각 테스트 후 핸들러 리셋  
// afterEach(() => {
//   server.resetHandlers();
// });

// 테스트 종료 후 MSW 서버 종료
// afterAll(() => {
//   server.close();
// });

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 테스트 전 localStorage 초기화
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
