# Reservation API Testing

This directory contains test data and scripts for testing the salon reservation API.

## Mock Reservation Data

The `data/mockReservations.js` file contains 5 mock reservation objects that can be used for testing the API routes. Each object includes all required fields:

- customerName
- date
- time
- stylist
- serviceType

These mock objects can be imported and used in any test script:

```javascript
const mockReservations = require('./data/mockReservations');
```

## Test Scripts

The following test scripts are available for testing different API endpoints:

### testReservationPost.js

This script tests the POST route for creating new reservations using the mock data.

### testReservationGet.js

This script tests the GET routes for retrieving all reservations and a specific reservation by ID.

### testReservationPut.js

This script tests the PUT route for updating an existing reservation.

### testReservationDelete.js

This script tests the DELETE route for removing a reservation.

### testUsers.js

This script tests the GET route for retrieving the users listing.

### testHomePage.js

This script tests the GET route for the home page.

## How to Run Tests

1. Make sure your server is running:
   ```
   npm start
   ```

2. In a separate terminal, run any of the test scripts:
   ```
   node test/testReservationPost.js
   node test/testReservationGet.js
   node test/testReservationPut.js
   node test/testReservationDelete.js
   node test/testUsers.js
   node test/testHomePage.js
   ```

Each script will run its tests and report whether the operations were successful.

## Using Mock Data in Your Own Tests

You can also use the mock data in your own test scripts or for manual testing:

```javascript
// Import the mock data
const mockReservations = require('./data/mockReservations');

// Use a single mock reservation
const sampleReservation = mockReservations[0];

// Or iterate through all mock reservations
mockReservations.forEach(reservation => {
  // Your test code here
});
```

## Adding More Tests

Feel free to add more test scripts to this directory as needed. You can use the existing mock data or create additional mock data for specific test cases.
