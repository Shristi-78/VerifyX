const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Face++ API credentials
const apiKey = '...';
const apiSecret = '...';

// Function to compare an uploaded photo with an image URL
async function compareFaceWithUrl(livePhotoPath, documentPhotoUrl) {
  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('api_secret', apiSecret);
console.log('why error????:', documentPhotoUrl);

  formData.append('image_file1', fs.createReadStream(livePhotoPath));
  formData.append('image_url2', documentPhotoUrl);

  try {
    const response = await axios.post('https://api-us.faceplusplus.com/facepp/v3/compare', formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.confidence > 80) {
      return { verified: true, confidence: response.data.confidence };
    } else {
      return { verified: false, confidence: response.data.confidence };
    }
  } catch (error) {
    console.error('Error comparing face with URL:', error.response?.data || error.message);
    return { verified: false, error: error.message };
  }
}

// Serve HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'face.html'));
});

// Variable to store the uploaded image URL
let storedJpgUrl = null;

// Endpoint to store the document photo URL
app.post('/face', (req, res) => {
  const { jpgUrl } = req.body;

  if (jpgUrl) {
    console.log('Received JPG URL:', jpgUrl);
    storedJpgUrl = jpgUrl;
    res.status(200).json({ message: 'JPG URL received successfully' });
  } else {
    res.status(400).json({ error: 'Invalid or missing JPG URL' });
  }
});

// Endpoint to compare an uploaded photo with the stored document photo URL
app.post('/compare', upload.single('photo1'), async (req, res) => {
  const livePhoto = req.file;
  const documentPhotoUrl = storedJpgUrl;

  console.log('Received live photo:', livePhoto);
  console.log('Stored document photo URL:', documentPhotoUrl);

  if (!livePhoto || !documentPhotoUrl) {
    return res.status(400).json({ error: 'Both the uploaded photo and photo URL are required' });
  }

  const livePhotoPath = livePhoto.path;

  try {
    const result = await compareFaceWithUrl(livePhotoPath, documentPhotoUrl);
    console.log('Face comparison result:', result);

    // Clean up the temporary uploaded file
    fs.unlinkSync(livePhotoPath);

    res.json(result);
  } catch (error) {
    console.error('Error during face comparison:', error);
    fs.unlinkSync(livePhotoPath); // Ensure cleanup on error
    res.status(500).json({ error: 'An error occurred during face comparison', details: error.message });
  }
});

// Start the server
app.listen(3021, () => {
  console.log('Server is running on port 3021');
});
