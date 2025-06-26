const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const FileStorage = await hre.ethers.getContractFactory('FileStorage');
  const fileStorage = await FileStorage.deploy();
  await fileStorage.waitForDeployment();
  console.log('FileStorage deployed to:', fileStorage.target);

const DocumentVerification = await hre.ethers.getContractFactory('DocumentVerification');
  const documentVerification = await DocumentVerification.deploy();
  await documentVerification.waitForDeployment();
  console.log('DocumentVerification deployed to:', documentVerification.target);

const Verification = await hre.ethers.getContractFactory('Verification');//Verification
  const verification = await Verification.deploy();
  await verification.waitForDeployment();
  console.log('Verification deployed to:', verification.target);


  // Adjust the path to the shared-config directory within the Docker container
  const configDir = path.resolve(__dirname, '../shared-config');
  const configFile = path.join(configDir, 'contract-address.json');

  // Create the directory if it doesn't exist
  //if (!fs.existsSync(configDir)) {
    //fs.mkdirSync(configDir, { recursive: true });
  //}

 const contractConfig = {
    fileStorageAddress: fileStorage.target,
    documentVerificationAddress: documentVerification.target,
    verificationAddress: verification.target,
  };

  fs.writeFileSync(configFile, JSON.stringify(contractConfig, null, 2));
  console.log(`Contract addresses saved to ${configFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment:", error);
    process.exit(1);
  });


