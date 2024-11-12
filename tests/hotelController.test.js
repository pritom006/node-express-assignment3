// tests/hotelController.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const hotelRoutes = require('../routes/hotelRoutes');

// Initialize the app
const app = express();
app.use(bodyParser.json());
app.use('/', hotelRoutes);

describe('Hotel API Endpoints', () => {
  it('should create a new hotel', async () => {
    const response = await request(app)
      .post('/hotel')
      .send({
        title: 'Sample Hotel',
        description: 'A sample hotel for testing',
        guest_count: 2,
        bedroom_count: 1,
        bathroom_count: 1,
        amenities: JSON.stringify(['wifi', 'parking']),
        host_information: JSON.stringify({ name: 'Host', contact: '123456789' }),
        address: 'Sample Address',
        latitude: '40.7128',
        longitude: '-74.0060',
        rooms: JSON.stringify([{ room_title: 'Room 1', bedroom_count: 1 }])
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Hotel created successfully');
  });

  it('should return 404 for a non-existent route', async () => {
    const response = await request(app).get('/nonexistentroute');
    expect(response.statusCode).toBe(404);
  });
});