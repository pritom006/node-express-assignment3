const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");


// Hotel routes
router.get("/", hotelController.getAllHotels);
router.post("/", hotelController.createHotel);
// POST images for a hotel
router.post('/images', (req, res) => {
    hotelController.createHotel(req, res); // This will handle image upload as part of hotel creation
});
  
router.get("/:slug", hotelController.getHotel);
router.put("/:slug", hotelController.updateHotel);
router.delete("/:slug", hotelController.deleteHotel);

module.exports = router;