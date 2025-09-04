// Test script for the reservation PUT route
const axios = require('axios');
const mockReservations = require('./data/mockReservations');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test updating a reservation
async function testUpdateReservation(id, updatedData) {
  try {
    const response = await axios.put(`${API_URL}/api/reservations/${id}`, updatedData);
    console.log(`Reservation with ID ${id} updated successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating reservation with ID ${id}:`, error.response?.data || error.message);
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

// Main function to run tests
async function runTests() {
  console.log('Starting reservation PUT tests...');

  // First create a test reservation to update
  console.log('Creating a test reservation...');
  const createdReservation = await createTestReservation();
  
  if (!createdReservation) {
    console.log('Failed to create test reservation. Aborting PUT tests.');
    return;
  }
  
  console.log('-----------------------------------');

  // Test updating the reservation
  console.log(`Testing PUT update for reservation ID ${createdReservation._id}...`);
  
  // Create updated data based on the original reservation
  const updatedData = {
    ...mockReservations[0],
    customerName: 'Updated Name',
    serviceType: 'Updated Service'
  };
  
  const updatedReservation = await testUpdateReservation(createdReservation._id, updatedData);
  
  if (updatedReservation && 
      updatedReservation.customerName === 'Updated Name' && 
      updatedReservation.serviceType === 'Updated Service') {
    console.log('PUT update test passed ✓');
  } else {
    console.log('PUT update test failed ✗');
  }
  console.log('-----------------------------------');

  // Test updating a non-existent reservation
  console.log('Testing PUT update for non-existent reservation...');
  const nonExistentId = 'non-existent-uuid-id';
  const nonExistentUpdate = await testUpdateReservation(nonExistentId, updatedData);
  
  if (!nonExistentUpdate) {
    console.log('PUT non-existent reservation test passed ✓ (Expected 404)');
  } else {
    console.log('PUT non-existent reservation test failed ✗ (Got a result when none was expected)');
  }
  console.log('-----------------------------------');

  // Test updating with invalid data (missing required fields)
  console.log('Testing PUT update with invalid data...');
  const invalidData = {
    customerName: 'Invalid Test'
    // Missing required fields
  };
  
  const invalidUpdate = await testUpdateReservation(createdReservation._id, invalidData);
  
  if (!invalidUpdate) {
    console.log('PUT invalid data test passed ✓ (Expected 400)');
  } else {
    console.log('PUT invalid data test failed ✗ (Got a result when none was expected)');
  }
  console.log('-----------------------------------');

  console.log('All PUT tests completed.');
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

module.exports = { testUpdateReservation, runTests };