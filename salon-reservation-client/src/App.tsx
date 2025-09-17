import React from 'react';
import { HashRouter } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import AppWrapper from './components/AppWrapper';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppWrapper>
          <AppLayout />
        </AppWrapper>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;