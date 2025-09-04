import React from 'react';
import ReactDOM from 'react-dom/client';
import ReservationForm from './components/ReservationForm';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Find the container element where we'll mount our React app
  const container = document.getElementById('react-app');
  
  if (container) {
    // Create a root for the React app
    const root = ReactDOM.createRoot(container);
    
    // Render the ReservationForm component
    root.render(
      <React.StrictMode>
        <ReservationForm />
      </React.StrictMode>
    );
  } else {
    console.error('Could not find #react-app element to mount React application');
  }
});