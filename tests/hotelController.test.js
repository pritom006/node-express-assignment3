

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const hotelRoutes = require('../routes/hotelRoutes');

// Initialize the app
const app = express();
app.use(bodyParser.json());
app.use('/', hotelRoutes);

describe('Hotel API Endpoints', () => {
  let hotelId; // Variable to store the hotel ID for later use in other tests

  // Test for creating a new hotel
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
    hotelId = response.body.hotel.hotel_id; // Store the hotel ID for use in other tests
  });

  // Test for uploading images for a specific hotel
  it('should upload images for a specific hotel', async () => {
    const response = await request(app)
      .post('/images')
      .field('hotel_id', hotelId)
      .attach('images', path.join(__dirname, 'testImage.jpg')); // Ensure testImage.jpg exists for this test
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Images uploaded successfully');
    expect(response.body.images).toHaveLength(1); // Expect one image to be uploaded
  });


  // Test for getting a specific hotel by ID
  it('should retrieve a specific hotel by hotel ID', async () => {
    const response = await request(app).get(`/hotel/${hotelId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('hotel_id', hotelId); // Validate hotel ID matches the created hotel
  });

  // Test for updating hotel details
  it('should update the hotel details', async () => {
    const updateData = {
      title: 'Updated Sample Hotel',
      guest_count: 4,
      amenities: JSON.stringify(['wifi', 'parking', 'pool'])
    };
    const response = await request(app)
      .put(`/hotel/${hotelId}`)
      .send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hotel updated successfully');
    expect(response.body.hotel.title).toBe(updateData.title); // Validate that title was updated
    expect(response.body.hotel.guest_count).toBe(updateData.guest_count); // Validate guest count was updated
  });

  // Test for a non-existent route
  it('should return 404 for a non-existent route', async () => {
    const response = await request(app).get('/nonexistentroute');
    expect(response.statusCode).toBe(404);
  });
});
