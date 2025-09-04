// Test script for the reservation GET routes
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test getting all reservations
async function testGetAllReservations() {
  try {
    const response = await axios.get(`${API_URL}/api/reservations`);
    console.log('All reservations retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting all reservations:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting a specific reservation by ID
async function testGetReservationById(id) {
  try {
    const response = await axios.get(`${API_URL}/api/reservations/${id}`);
    console.log(`Reservation with ID ${id} retrieved successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting reservation with ID ${id}:`, error.response?.data || error.message);
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting reservation GET tests...');

  // Test getting all reservations
  console.log('Testing GET all reservations...');
  const allReservations = await testGetAllReservations();
  
  if (allReservations) {
    console.log('GET all reservations test passed ✓');
  } else {
    console.log('GET all reservations test failed ✗');
  }
  console.log('-----------------------------------');

  // If we have reservations, test getting one by ID
  if (allReservations && allReservations.length > 0) {
    const firstReservationId = allReservations[0]._id;
    console.log(`Testing GET reservation by ID ${firstReservationId}...`);
    const singleReservation = await testGetReservationById(firstReservationId);
    
    if (singleReservation) {
      console.log('GET reservation by ID test passed ✓');
    } else {
      console.log('GET reservation by ID test failed ✗');
    }
  } else {
    console.log('Skipping GET by ID test as no reservations are available.');
  }
  console.log('-----------------------------------');

  // Test getting a non-existent reservation
  console.log('Testing GET non-existent reservation...');
  const nonExistentId = 'non-existent-uuid-id';
  const nonExistentReservation = await testGetReservationById(nonExistentId);
  
  if (!nonExistentReservation) {
    console.log('GET non-existent reservation test passed ✓ (Expected 404)');
  } else {
    console.log('GET non-existent reservation test failed ✗ (Got a result when none was expected)');
  }
  console.log('-----------------------------------');

  console.log('All GET tests completed.');
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

module.exports = { testGetAllReservations, testGetReservationById, runTests };