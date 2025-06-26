require('dotenv').config(); // Load environment variables from .env
const Web3 = require('web3').default; // Use .default if using ESM
const cors = require('cors');
const express = require('express'); 
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');
const { JsonRpcProvider, Wallet, Contract, hashMessage, toUtf8Bytes } = require('ethers');
const crypto = require('crypto'); // Node's built-in crypto module for hashing and signing

console.log("Starting the app...");
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // Allow all origins
app.use(express.static(path.join(__dirname,'public')));
app.use('/shared-config', express.static('/app/shared-config'));
// Ethereum setup
console.log("Initializing Ethereum setup...");
const web3 = new Web3('http://host.docker.internal:8545');  // Replace with your local blockchain RPC URL  const web3 = new Web3('http://127.0.0.1:8545'); 
const walletPrivateKey = "..."; // Use environment variable for private key
console.log("Wallet Private Key:", walletPrivateKey);
console.log("Private Key Length:", walletPrivateKey.length);
const privateKeyBuffer = Buffer.from(walletPrivateKey, 'hex');
if (!walletPrivateKey) {
    console.error("Private key is missing. Please set it in a .env file.");
    process.exit(1); // Exit if private key is not set
}


const account = web3.eth.accounts.privateKeyToAccount(privateKeyBuffer);
const password = '';
web3.eth.accounts.wallet.add(account); // Add account to Web3 wallet

// Serve the org_profile.html file from the frontend/templates directory
app.get('/org_profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/templates/upload_documents.html'));
});

// Serve the upload_documents.html file from the frontend/templates directory
app.get('/upload_documents', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/templates/upload_documents.html'));
});

//const wallet = new Wallet(walletPrivateKey, provider);
console.log("Ethereum setup completed.");

// Smart contract ABI (replace this with your own)
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "documents",
        "outputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "signature",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "verifier",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getDocument",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyDocument",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_hash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_signature",
                "type": "string"
            }
        ],
        "name": "storeSignedHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contractABI2 = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataHash",
          "type": "string"
        }
      ],
      "name": "isVerified",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataHash",
          "type": "string"
        }
      ],
      "name": "storeHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "verifiedHashes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
let contract; // Declare contract variable
let contract2;
// Function to get the contract address from the JSON file
async function getContractAddress() {
    try {
        const response = await fetch('http://nextgen:3000/shared-config/contract-address.json');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('Failed to fetch contract address');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Log the entire response
        
        // Change this to the appropriate property name you want to use
        const contractAddress = data.documentVerificationAddress; // or data.documentVerificationAddress
        if (!contractAddress) {
            throw new Error('Contract address is missing in the JSON response');
        }
        return contractAddress;
    } catch (error) {
        console.error('Error fetching contract address:', error);
        throw error;
    }
}

// Function to initialize the contract
async function initializeApp() {
    try {
        const contractAddress = await getContractAddress();
        console.log("Fetched contract address:", contractAddress);
        contract = new web3.eth.Contract(contractABI, contractAddress); 

        console.log('Contract initialized successfully.');

        // Start the server after contract is initialized
        const port = 4000;
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error initializing the contract:', error);
        process.exit(1);
    }
}
async function getContractAddress2() {
    try {
        const response2 = await fetch('http://nextgen:3000/shared-config/contract-address.json');
        console.log('Response status:', response2.status);
        if (!response2.ok) {
            throw new Error('Failed to fetch contract address');
        }
        const data2 = await response2.json();
        console.log('Fetched data:', data2); // Log the entire response
        
        // Change this to the appropriate property name you want to use
        const contractAddress2 = data2.verificationAddress; // or data.documentVerificationAddress
        if (!contractAddress2) {
            throw new Error('Contract address is missing in the JSON response');
        }
        return contractAddress2;
    } catch (error) {
        console.error('Error fetching contract address:', error);
        throw error;
    }
}

// Function to initialize the contract
async function initializeApp2() {
    try {
        const contractAddress2 = await getContractAddress2();
        console.log("Fetched contract address:", contractAddress2);
        contract2 = new web3.eth.Contract(contractABI2, contractAddress2); 

        console.log('Contract initialized successfully.');

        // Start the server after contract is initialized
        //const port = 4000;
        
    } catch (error) {
        console.error('Error initializing the contract:', error);
        process.exit(1);
    }
}

// Call the initializeApp function to set up the contract and start the server
initializeApp();
initializeApp2();
let metadataString;
async function storeData() {
  try {
    const response = await axios.post('http://localhost:5000/store_data', metadataString, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Response from Flask server:", response.data);
  } catch (error) {
    console.error("Error storing data:", error.response ? error.response.data : error.message);
  }
}

// Endpoint to upload PDF, sign hash, and store on blockchain
app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    console.log("Received file upload request.");
    console.log("Uploaded file details:", req.file);
    const filePath = path.join(__dirname, req.file.path);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        console.log("PDF Metadata: ", data.info);
        metadataString = JSON.stringify(data.info);
        const hash = crypto.createHash('sha256').update(metadataString).digest('hex'); // Hashing the metadata string
        console.log("Generated Hash: ", hash);
const messageHex = web3.utils.utf8ToHex(metadataString);

const accounts = await web3.eth.getAccounts();
                const fromAccount = accounts[0]; 
console.log('Signing parameters:', {
            message: metadataString,
            address: account.address,
            password: password // Show this only if it's non-empty
        });
	//storeData();
        //const signature = await web3.eth.personal.sign(messageHex, account.address,password); 
        //console.log('Generated Signature: ', signature);

        const tx = await contract2.methods.storeHash(hash).send({ from: fromAccount }); // Store on blockchain
        console.log('Hash stored on blockchain successfully.');
        res.status(200).json({
            message: 'Hash and signature stored on blockchain.',
            textContent: data.text
        });
    } catch (error) {
        console.error('Error processing PDF or storing hash:', error);
        res.status(500).send('Error processing PDF or storing hash.');
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting the uploaded file:', err);
        });
    }
});