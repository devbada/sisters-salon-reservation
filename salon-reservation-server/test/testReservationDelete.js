// Test script for the reservation DELETE route
const axios = require('axios');
const mockReservations = require('./data/mockReservations');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test deleting a reservation
async function testDeleteReservation(id) {
  try {
    const response = await axios.delete(`${API_URL}/api/reservations/${id}`);
    console.log(`Reservation with ID ${id} deleted successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reservation with ID ${id}:`, error.response?.data || error.message);
    return null;
  }
}

// Function to create a test reservation first
async function createTestReservation() {
  try {
    const response = await axios.post(`${API_URL}/api/reservations`, mockReservations[0]);
    console.log('Test reservation created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating test reservation:', error.response?.data || error.message);
    return null;
  }
}

// Function to verify a reservation is deleted
async function verifyReservationDeleted(id) {
  try {
    const response = await axios.get(`${API_URL}/api/reservations/${id}`);
    console.log(`Reservation with ID ${id} still exists:`, response.data);
    return false; // Reservation still exists
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`Verified: Reservation with ID ${id} no longer exists`);
      return true; // Reservation is deleted
    }
    console.error(`Error verifying deletion:`, error.message);
    return false;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting reservation DELETE tests...');

  // First create a test reservation to delete
  console.log('Creating a test reservation...');
  const createdReservation = await createTestReservation();
  
  if (!createdReservation) {
    console.log('Failed to create test reservation. Aborting DELETE tests.');
    return;
  }
  
  console.log('-----------------------------------');

  // Test deleting the reservation
  console.log(`Testing DELETE for reservation ID ${createdReservation._id}...`);
  const deletedReservation = await testDeleteReservation(createdReservation._id);
  
  if (deletedReservation) {
    console.log('DELETE operation returned data ✓');
    
    // Verify the reservation is actually deleted
    const isDeleted = await verifyReservationDeleted(createdReservation._id);
    if (isDeleted) {
      console.log('DELETE verification passed ✓ (Reservation no longer exists)');
    } else {
      console.log('DELETE verification failed ✗ (Reservation still exists)');
    }
  } else {
    console.log('DELETE operation failed ✗');
  }
  console.log('-----------------------------------');

  // Test deleting a non-existent reservation
  console.log('Testing DELETE for non-existent reservation...');
  const nonExistentId = 'non-existent-uuid-id';
  const nonExistentDelete = await testDeleteReservation(nonExistentId);
  
  if (!nonExistentDelete) {
    console.log('DELETE non-existent reservation test passed ✓ (Expected 404)');
  } else {
    console.log('DELETE non-existent reservation test failed ✗ (Got a result when none was expected)');
  }
  console.log('-----------------------------------');

  console.log('All DELETE tests completed.');
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

module.exports = { testDeleteReservation, runTests };