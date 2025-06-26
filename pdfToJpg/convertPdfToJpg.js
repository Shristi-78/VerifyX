const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { createCanvas } = require('canvas');

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dgyeeigq7', // Replace with your Cloudinary cloud name
  api_key: '358489372894979', // Replace with your Cloudinary API key
  api_secret: 'EXHBsi9lxA_y9oiPrwDWAhj7pi8', // Replace with your Cloudinary API secret
});

async function convertPdfToJpg(pdfFilePath, outputDir) {
  try {
    const pdfjsLib = (await import('pdfjs-dist/legacy/build/pdf')).default;
    const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath));
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

    const totalPages = pdfDoc.numPages;
    const imagePaths = [];

    for (let i = 0; i < totalPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      const outputFilePath = `${outputDir}/page-${i + 1}.jpg`;
      const imageBuffer = canvas.toBuffer('image/jpeg');
      fs.writeFileSync(outputFilePath, imageBuffer);

      imagePaths.push(outputFilePath);
      console.log(`Page ${i + 1} saved as JPG: ${outputFilePath}`);
    }

    return imagePaths;
  } catch (error) {
    console.error('Error converting PDF to JPG:', error);
    return [];
  }
}

async function uploadImagesToCloudinary(imagePaths) {
  try {
    for (const imagePath of imagePaths) {
      await cloudinary.uploader.upload(
        imagePath,
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.error('Upload Error:', error);
          } else {
            console.log('Image uploaded to Cloudinary:', result.secure_url);
          }
        }
      );
    }
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error);
  }
}

const pdfFilePath = '/usr/src/app/downloads/167058.pdf'; // Replace with your PDF file path
const outputDir = './imgs'; // Replace with your desired output directory

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const imagePaths = await convertPdfToJpg(pdfFilePath, outputDir);
  if (imagePaths.length > 0) {
    await uploadImagesToCloudinary(imagePaths);
  }
})();
