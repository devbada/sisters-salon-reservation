import React from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppWrapper from './components/AppWrapper';
import AppContent from './AppContent';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppWrapper>
          <AppContent />
        </AppWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;