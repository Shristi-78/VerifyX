import cors from 'cors';
import express from 'express';
import twilio from 'twilio';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { create } from 'ipfs-http-client'; // Import IPFS HTTP client

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: 'http://localhost:5000', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

const app = express();
app.use(bodyParser.json());
const port = 3000;
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname,'public')));
app.use('/shared-config', express.static('/app/shared-config'));
app.use(cors(corsOptions));

// Serve the upload_documents.html file from the frontend/templates directory
app.get('/user_register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/templates/user_register.html'));
});

let phoneNumber;
app.post('/login', (req, res) => {
     phone = req.body.phone;

    // Handle the received phone number (e.g., store it, validate it, etc.)
    console.log('Received phone number:', phone);

    // Respond back to the client
    res.json({ message: 'Login successful', phone: phone });
});

const client = new twilio('...', '...');

// Store OTPs for users temporarily (use a more secure solution in production)
const otpStore = {};


// Endpoint to send OTP
app.post('/send-otp', async (req, res) => {
  phoneNumber = '+91...';

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phoneNumber] = otp; // Save OTP

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}. Do not share it with anyone.`,
      from: 'whatsapp:+14155238886', // Twilio's WhatsApp Sandbox Number
      to: `whatsapp:${phoneNumber}`
    });
    res.status(200).send({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ message: 'Failed to send OTP' });
  }
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  const validOtp = otpStore[phoneNumber];

  if (otp === validOtp) {
    res.status(200).send({ verified: true });
    delete otpStore[phoneNumber]; // Remove OTP after verification
  } else {
    res.status(400).send({ verified: false });
  }
});

// In-memory "database" for storing hashes (you could use a real database)
const storedHashes = {
    "f15db8a4e6b2173ccce9dabd05312e694f938a6f31492fc00d7e5b4cb8b50b59": "Document A",
    "0e99eb1d2f5c814eefc35955cbe4236991716bc71a1127248d009ec01a819885": "Document C",
    "bb1a8a8970169239f3775abdbbf23ea4f98187474e23e01659b48ffbdf932011": "Document D",
    "11cb99b69d98ca3402d4ce2027f60375218f52175797aef85e618e830c8a281a": "Document B"
};
// Set up IPFS client
const ipfs = create({ url: 'http://host.docker.internal:5001' }); // Change this URL if using a different IPFS node (local, Infura, etc.)

// Configure multer to handle file uploads
const upload = multer({ dest: 'uploads/' });



// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the view.html file to allow viewing files via IPFS hash



// Serve the upload_documents.html file from the frontend/templates directory
app.get('/upload_documents', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/templates/upload_documents.html'));
});

// Serve the org_profile.html file from the frontend/templates directory
app.get('/org_profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/templates/org_profile.html'));
});

// Handle file upload and IPFS storage
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Read the uploaded file
        const fileData = fs.readFileSync(req.file.path);

        // Upload the file to IPFS
        const result = await ipfs.add(fileData);

        // Return the IPFS hash to the user
        res.send(`File uploaded to IPFS! Hash: ${result.path}`);

        // Optionally, remove the file from the server after uploading to IPFS
        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        res.status(500).send('Error uploading file to IPFS.');
    }
});

// app.use(cors());
app.use(express.json());

// Mock endpoint for verifying documents
app.post('/verifyDocument', (req, res) => {
    const { fileHash } = req.body; // Assuming you send a hash of the file
    console.log("Received request to verify document. File hash:", fileHash);

    // Check if the hash exists in our "database"
    if (storedHashes[fileHash]) {
        console.log("Verification successful for hash:", fileHash);
        res.status(200).json({ 
            verified: true, 
            message: `Document verified!` 
        });
    } else {
        console.log("Verification failed for hash:", fileHash);
        res.status(200).json({ 
            verified: false, 
            message: "Document does not match any record." 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
