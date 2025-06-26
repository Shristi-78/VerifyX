# Document Verification System

> **⚠️ Security Notice:**
> 
> This project contains placeholder values (such as `'...'`) for private keys and API credentials in the codebase. **You must replace these placeholders with your actual keys and credentials using environment variables or configuration files before running the project.**
>
> **Never commit real private keys, API secrets, or other sensitive information to version control.**

A comprehensive blockchain-based document verification system with face recognition capabilities, built using multiple technologies including Ethereum smart contracts, Flask, Node.js, and Docker.

## 🏗️ Project Architecture

This project consists of multiple microservices:

- **Frontend** (`frontend/`) - Flask-based web application for user interface
- **App** (`app/`) - Node.js backend service for document processing and blockchain integration
- **Face Recognition** (`face/`) - Face verification service using Face++ API
- **Smart Contracts** (`hardhatProj/`) - Ethereum smart contracts for document verification
- **NextGen** (`nextGen/`) - Advanced document processing service
- **PDF to JPG Converter** (`pdfToJpg/`) - Utility service for document format conversion

## 🚀 Features

- **Document Upload & Verification**: Secure document storage with IPFS integration
- **Face Recognition**: Biometric verification using Face++ API
- **Blockchain Integration**: Ethereum smart contracts for immutable document verification
- **User Management**: Registration and authentication for users and organizations
- **Access Control**: Granular permission system for document access
- **PDF Processing**: Convert PDF documents to images for processing
- **Docker Support**: Containerized deployment for all services

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Docker and Docker Compose
- MetaMask or similar Web3 wallet
- Face++ API credentials (for face recognition)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd my-dapp-project
```

### 2. Environment Setup

Create `.env` files in each service directory with appropriate configuration:

#### App Service (`app/.env`)
```env
NODE_ENV=development
PROVIDER_URL=http://localhost:8545
WALLET_PRIVATE_KEY=your_private_key_here
```

#### Face Service (`face/.env`)
```env
FACE_API_KEY=your_face_api_key
FACE_API_SECRET=your_face_api_secret
```

#### Frontend Service (`frontend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///user_data.db
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies for all services
cd app && npm install
cd ../face && npm install
cd ../hardhatProj && npm install
cd ../nextGen && npm install
cd ../pdfToJpg && npm install

# Install Python dependencies
cd ../frontend
pip install -r requirements.txt
```

### 4. Smart Contract Deployment

```bash
cd hardhatProj
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

## 🐳 Docker Deployment

The easiest way to run the entire system is using Docker Compose:

```bash
docker-compose up --build
```

This will start all services:
- **Frontend**: http://localhost:5000
- **App Service**: http://localhost:4000
- **Face Recognition**: http://localhost:3021
- **NextGen Service**: http://localhost:3000
- **Hardhat Node**: http://localhost:8545

## 📁 Project Structure

```
my-dapp-project/
├── app/                    # Main Node.js backend service
│   ├── app.js             # Express server with blockchain integration
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Docker configuration
├── face/                   # Face recognition service
│   ├── face.js            # Face++ API integration
│   ├── face.html          # Face verification interface
│   └── models/            # TensorFlow.js models
├── frontend/              # Flask web application
│   ├── app.py             # Main Flask application
│   ├── templates/         # HTML templates
│   ├── static/            # CSS, JS, and images
│   └── requirements.txt   # Python dependencies
├── hardhatProj/           # Ethereum smart contracts
│   ├── contracts/         # Solidity smart contracts
│   ├── scripts/           # Deployment scripts
│   └── hardhat.config.js  # Hardhat configuration
├── nextGen/               # Advanced document processing
│   ├── server.js          # Express server
│   └── public/            # Frontend assets
├── pdfToJpg/              # PDF conversion utility
│   └── convertPdfToJpg.js # PDF to image converter
├── shared-config/         # Shared configuration files
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## 🔧 Configuration

### Smart Contracts

The system uses two main smart contracts:
- `DocumentVerification.sol` - Stores document hashes and signatures
- `FileStorage.sol` - Manages file storage on IPFS
- `Verification.sol` - Handles verification logic

### API Endpoints

#### Frontend (Flask)
- `GET /` - Main dashboard
- `POST /user/register/` - User registration
- `POST /user/login/` - User authentication
- `POST /upload_documents` - Document upload
- `GET /user/profile/` - User profile

#### App Service (Node.js)
- `POST /storeData` - Store document data
- `GET /org_profile` - Organization profile
- `POST /upload_documents` - Document upload endpoint

#### Face Recognition Service
- `POST /face` - Store document photo URL
- `POST /compare` - Compare live photo with document

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **API Credentials**: Store sensitive credentials in environment variables
- **Database**: Use secure database connections in production
- **HTTPS**: Always use HTTPS in production environments

## 🧪 Testing

```bash
# Test smart contracts
cd hardhatProj
npx hardhat test

# Test frontend (if tests exist)
cd ../frontend
python -m pytest

# Test face recognition service
cd ../face
npm test
```

## 📝 API Documentation

### Face Recognition API

**Store Document Photo URL**
```http
POST /face
Content-Type: application/json

{
  "jpgUrl": "https://example.com/document.jpg"
}
```

**Compare Faces**
```http
POST /compare
Content-Type: multipart/form-data

photo1: [file upload]
```

### Document Verification API

**Store Document Data**
```http
POST /storeData
Content-Type: application/json

{
  "hash": "document_hash",
  "signature": "digital_signature"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each service directory
- Review the Docker logs for debugging

## 🔄 Updates

- **v1.0.0**: Initial release with basic document verification
- **v1.1.0**: Added face recognition capabilities
- **v1.2.0**: Enhanced blockchain integration and UI improvements

---

**Note**: This is a development version. For production deployment, ensure all security measures are properly implemented and tested. 