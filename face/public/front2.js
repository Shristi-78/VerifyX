const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dgyeeigq7/auto/upload";
const cloudinaryApiKey = "...";


document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files[0]) {
        alert("Please select a PDF file!");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "..."); // Define your upload preset in Cloudinary settings.

    try {
        // Upload the PDF to Cloudinary
        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (data.error) {
            console.error("Upload error:", data.error);
            alert("Error uploading file.");
            return;
        }

        const pdfUrl = data.secure_url;

        // Convert the PDF to JPG (Cloudinary auto format)
        const jpgUrl = pdfUrl.replace(/\.pdf$/, ".jpg");
console.log('jpgUrl: ',jpgUrl);

        // Fetch call to send the JPG URL to the backend
        const backendResponse = await fetch('http://localhost:3021/face', {
            method: 'POST', // Use POST method for sending data
            headers: {
                'Content-Type': 'application/json', // Indicate JSON payload
            },
            body: JSON.stringify({ jpgUrl }), // Send the JPG URL in the request body
            cache: 'no-cache', 
        });

        if (backendResponse.ok) {
            const responseData = await backendResponse.json(); // Parse the JSON response from the server
            console.log('Response from backend:', responseData);
        } else {
            throw new Error('Failed to send JPG URL to the backend');
        }

    } catch (err) {
        console.error("Error:", err);
        alert("An error occurred while processing the file.");
    }
}); // Ensure this closing parenthesis and brace are present