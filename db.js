const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const hotelsFilePath = path.join(dataDir, 'hotels.json');

// Ensure hotels.json exists
if (!fs.existsSync(hotelsFilePath)) {
  fs.writeFileSync(hotelsFilePath, '[]', 'utf8');
}

const readData = () => {
  try {
    const data = fs.readFileSync(hotelsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading hotels data:', error);
    // Return empty array if file doesn't exist or is corrupted
    return [];
  }
};

const writeData = (data) => {
  try {
    const dirPath = path.dirname(hotelsFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(hotelsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing hotels data:', error);
    return false;
  }
};

module.exports = {
  readData,
  writeData
};