const express = require("express");
const bodyParser = require("body-parser");
const hotelRoutes = require("./routes/hotelRoutes");
//const cors = require("cors");
const path = require('path');

// const corsOptions = {
//   origin: "http://localhost:3006", // restrict CORS to this origin
//   optionsSuccessStatus: 200, // some legacy browsers require this
// };

const app = express();
// app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/", hotelRoutes);

app.use('/images', express.static(path.join(__dirname, 'data/images')));
// If any route not match then this will work.
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});



const PORT = process.env.PORT || 3000 || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});