

const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const upload = require('../middlewares/upload');

// Routes
router.post('/hotel', upload.array('images', 10), hotelController.createHotel);
router.post('/images', upload.array('images', 10), hotelController.uploadImages);
router.get('/hotel/:hotelId', hotelController.getHotel);
router.put('/hotel/:hotelId', hotelController.updateHotel);

module.exports = router;