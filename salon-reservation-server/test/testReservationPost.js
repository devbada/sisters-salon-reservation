// Test script for the reservation POST route
const axios = require('axios');
const mockReservations = require('./data/mockReservations');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test creating a reservation
async function testCreateReservation(reservationData) {
  try {
    const response = await axios.post(`${API_URL}/api/reservations`, reservationData);
    console.log('Reservation created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error.response?.data || error.message);
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting reservation POST tests...');

  // Test each mock reservation
  for (const reservation of mockReservations) {
    console.log(`Testing reservation for ${reservation.customerName}...`);
    const result = await testCreateReservation(reservation);

    if (result) {
      console.log('Test passed ✓');
    } else {
      console.log('Test failed ✗');
    }
    console.log('-----------------------------------');
  }

  console.log('All tests completed.');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  console.log('Make sure your server is running before executing these tests.');
  console.log('You can start the server with: npm start');
  console.log('-----------------------------------');

  runTests().catch(err => {
    console.error('Test execution error:', err);
  });
}

module.exports = { testCreateReservation, runTests };
