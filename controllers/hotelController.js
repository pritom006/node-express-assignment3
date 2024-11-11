const { readData, writeData } = require('../db');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'data/images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).array('images', 10); // Allow up to 10 images

const getAllHotels = (req, res) => {
  try {
    const hotels = readData();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving hotels' });
  }
};

const createHotel = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const hotels = readData();
      const {
        title,
        description,
        guest_count,
        bedroom_count,
        bathroom_count,
        amenities,
        host_information,
        address,
        latitude,
        longitude
      } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      // Generate slug
      let baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (hotels.some(hotel => hotel.slug === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Process uploaded images
      const images = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

      if (images.length < 1) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      const newHotel = {
        id: uuidv4(),
        slug,
        images,
        title,
        description,
        guest_count: parseInt(guest_count) || 0,
        bedroom_count: parseInt(bedroom_count) || 0,
        bathroom_count: parseInt(bathroom_count) || 0,
        amenities: amenities ? JSON.parse(amenities) : [],
        host_information: host_information ? JSON.parse(host_information) : {},
        address: address || '',
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        created_at: new Date().toISOString()
      };

      hotels.push(newHotel);
      writeData(hotels);

      res.status(201).json({ message: 'Hotel created successfully', hotel: newHotel });
    } catch (error) {
      res.status(500).json({ error: 'Error creating hotel: ' + error.message });
    }
  });
};

const getHotel = (req, res) => {
  try {
    const { slug } = req.params;
    const hotels = readData();
    const hotel = hotels.find(h => h.slug === slug);

    if (hotel) {
      res.status(200).json(hotel);
    } else {
      res.status(404).json({ error: 'Hotel not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving hotel' });
  }
};

const updateHotel = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { slug } = req.params;
      const hotels = readData();
      const hotelIndex = hotels.findIndex(h => h.slug === slug);

      if (hotelIndex === -1) {
        return res.status(404).json({ error: 'Hotel not found' });
      }

      const currentHotel = hotels[hotelIndex];
      const {
        title,
        description,
        guest_count,
        bedroom_count,
        bathroom_count,
        amenities,
        host_information,
        address,
        latitude,
        longitude
      } = req.body;

      // Process new images if uploaded
      const newImages = req.files ? req.files.map(file => `/images/${file.filename}`) : [];
      const images = newImages.length > 0 ? newImages : currentHotel.images;

      const updatedHotel = {
        ...currentHotel,
        title: title || currentHotel.title,
        description: description || currentHotel.description,
        images,
        guest_count: parseInt(guest_count) || currentHotel.guest_count,
        bedroom_count: parseInt(bedroom_count) || currentHotel.bedroom_count,
        bathroom_count: parseInt(bathroom_count) || currentHotel.bathroom_count,
        amenities: amenities ? JSON.parse(amenities) : currentHotel.amenities,
        host_information: host_information ? JSON.parse(host_information) : currentHotel.host_information,
        address: address || currentHotel.address,
        latitude: parseFloat(latitude) || currentHotel.latitude,
        longitude: parseFloat(longitude) || currentHotel.longitude,
        updated_at: new Date().toISOString()
      };

      hotels[hotelIndex] = updatedHotel;
      writeData(hotels);

      res.status(200).json({ message: 'Hotel updated successfully', hotel: updatedHotel });
    } catch (error) {
      res.status(500).json({ error: 'Error updating hotel: ' + error.message });
    }
  });
};

const deleteHotel = (req, res) => {
  try {
    const { slug } = req.params;
    const hotels = readData();
    const hotelIndex = hotels.findIndex(h => h.slug === slug);

    if (hotelIndex === -1) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Delete associated images
    const hotel = hotels[hotelIndex];
    hotel.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', 'data', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    hotels.splice(hotelIndex, 1);
    writeData(hotels);

    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting hotel' });
  }
};

module.exports = {
  getAllHotels,
  createHotel,
  getHotel,
  updateHotel,
  deleteHotel
};