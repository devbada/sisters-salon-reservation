// Test script for the home page route
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:4000'; // Updated to match server port

// Function to test getting the home page
async function testGetHomePage() {
  try {
    // Set responseType to 'text' to handle HTML response
    const response = await axios.get(`${API_URL}/`, { responseType: 'text' });
    console.log('Home page retrieved successfully. Response length:', response.data.length);
    // Check if the response contains expected HTML content
    const containsExpressTitle = response.data.includes('Express');
    console.log('Response contains "Express" title:', containsExpressTitle);
    return response.data;
  } catch (error) {
    console.error('Error getting home page:', error.response?.data || error.message);
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting home page tests...');

  // Test getting the home page
  console.log('Testing GET home page...');
  const homePageResponse = await testGetHomePage();
  
  if (homePageResponse) {
    console.log('GET home page test passed ✓');
  } else {
    console.log('GET home page test failed ✗');
  }
  console.log('-----------------------------------');

  console.log('All home page tests completed.');
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

module.exports = { testGetHomePage, runTests };