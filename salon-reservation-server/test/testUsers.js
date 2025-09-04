// Test script for the users routes
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test getting users listing
async function testGetUsers() {
  try {
    const response = await axios.get(`${API_URL}/users`);
    console.log('Users listing retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting users listing:', error.response?.data || error.message);
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting users API tests...');

  // Test getting users listing
  console.log('Testing GET users listing...');
  const usersResponse = await testGetUsers();
  
  if (usersResponse) {
    console.log('GET users listing test passed ✓');
  } else {
    console.log('GET users listing test failed ✗');
  }
  console.log('-----------------------------------');

  console.log('All users API tests completed.');
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

module.exports = { testGetUsers, runTests };