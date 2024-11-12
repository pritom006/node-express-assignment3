const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const upload = require("../middlewares/upload");

// Utility function to generate a new hotel ID
const generateHotelId = () => "h" + uuidv4().slice(0, 3);

// Controller to create a new hotel
const createHotel = (req, res) => {
  try {
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
      longitude,
      rooms
    } = req.body;

    // if (!title || !description || !guest_count || !bedroom_count || !bathroom_count || !amenities || !host_information || !address) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    const hotelId = generateHotelId();
    const slug = slugify(title, { lower: true, strict: true });
    const images = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

    const parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    const parsedHostInfo = typeof host_information === "string" ? JSON.parse(host_information) : host_information;
    const parsedRooms = typeof rooms === "string" ? JSON.parse(rooms) : rooms;

    const newHotel = {
      hotel_id: hotelId,
      slug: slug,
      images: images,
      title: title,
      description: description,
      guest_count: parseInt(guest_count),
      bedroom_count: parseInt(bedroom_count),
      bathroom_count: parseInt(bathroom_count),
      amenities: parsedAmenities,
      host_information: parsedHostInfo,
      address: address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      rooms: parsedRooms.map(room => ({
        hotel_slug: slug,
        room_slug: slugify(room.room_title, { lower: true, strict: true }),
        room_image: room.room_image,
        room_title: room.room_title,
        bedroom_count: parseInt(room.bedroom_count)
      }))
    };

    const filePath = path.join("data", `${hotelId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(newHotel, null, 2));

    res.status(201).json({ message: "Hotel created successfully", hotel: newHotel });
  } catch (error) {
    res.status(500).json({ error: "Error creating hotel: " + error.message });
  }
};

// Controller to upload images for a specific hotel
const uploadImages = (req, res) => {
  const hotelId = req.body.hotel_id;
  if (!hotelId) {
    return res.status(400).json({ error: "Hotel ID is required" });
  }

  const directoryPath = path.join(__dirname, "../data", `${hotelId}.json`);
  if (!fs.existsSync(directoryPath)) {
    return res.status(404).json({ error: "Hotel not found" });
  }

  const hotelData = JSON.parse(fs.readFileSync(directoryPath, "utf-8"));
  const imageUrls = req.files ? req.files.map(file => `/images/${file.filename}`) : [];
  hotelData.images = hotelData.images.concat(imageUrls);

  fs.writeFileSync(directoryPath, JSON.stringify(hotelData, null, 2));
  res.status(200).json({ message: "Images uploaded successfully", images: imageUrls });
};

// Controller to get all hotels
const getHotels = (req, res) => {
  const directoryPath = path.join(__dirname, "../data");
  const hotelFiles = fs.readdirSync(directoryPath);

  const hotels = hotelFiles.map((file) => {
    const filePath = path.join(directoryPath, file);
    const hotelData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return hotelData;
  });

  res.status(200).json(hotels);
};


// Controller to get a specific hotel by hotelId or slug
const getHotel = (req, res) => {
  const hotelId = req.params.hotelId;
  const filePath = path.join(__dirname, "../data", `${hotelId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Hotel not found" });
  }

  const hotelData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  res.status(200).json(hotelData);
};

// Controller to update hotel details
const updateHotel = (req, res) => {
  const hotelId = req.params.hotelId;
  const filePath = path.join(__dirname, "../data", `${hotelId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Hotel not found" });
  }

  const hotelData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const updatedData = req.body;

  const updatedHotel = { ...hotelData, ...updatedData };
  fs.writeFileSync(filePath, JSON.stringify(updatedHotel, null, 2));

  res.status(200).json({ message: "Hotel updated successfully", hotel: updatedHotel });
};


module.exports = {
  createHotel,
  getHotels,
  getHotel,
  updateHotel,
  uploadImages
};