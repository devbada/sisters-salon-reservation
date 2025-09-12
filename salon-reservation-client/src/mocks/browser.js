import { setupWorker } from 'msw/browser';
import { handlers } from '../shared/api/mocks/handlers.ts';

export const worker = setupWorker(...handlers);