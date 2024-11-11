// const express = require('express');

// const app = express();

// app.get('/', (req, res) => {
//     res.send('<h1>Hello World</h1>');
// });

// app.listen(8000, () => console.log("Server is running on port 8000"));

const express = require("express");
const bodyParser = require("body-parser");
const hotelRoutes = require("./routes/hotelRoutes");
const cors = require("cors");
const path = require('path');

const corsOptions = {
  origin: "http://localhost:3006", // restrict CORS to this origin
  optionsSuccessStatus: 200, // some legacy browsers require this
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/hotel", hotelRoutes);
// If any route not match then this will work.
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use('/images', express.static(path.join(__dirname, 'data/images')));

const PORT = process.env.PORT || 3000 || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});