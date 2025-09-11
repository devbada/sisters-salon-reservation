import React from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import AppWrapper from './components/AppWrapper';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <AppWrapper>
        <AppContent />
      </AppWrapper>
    </AuthProvider>
  );
}

export default App;