document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convert_btn');
    const downloadBtn = document.getElementById('download_btn');
    const extractedText = document.getElementById('result');
    const convertMsg = document.getElementById("convert_msg");

    let imageDataUrl = '';
    let imagePreview;
    let isConverted = false;
    let extractedTextValue = '';

    async function convert() {
        try {
            if (!imageDataUrl) {
                alert("Upload an image!");
                return;
            }

            if (!isConverted) {
                convertMsg.style.color="black"
                convertMsg.textContent = "Converting...";

                // Convert the image only if it hasn't been converted yet
                const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', { logger: m => console.log(m) });

                if (text) {
                    extractedTextValue = text;
                    isConverted = true;
                    extractedText.style.backgroundColor = '#f9f9f9';
                    extractedText.textContent = text;
                    convertMsg.style.color="green"
                    convertMsg.textContent = "Conversion Complete";
                    return text;
                } else {
                    alert('Text extraction failed.');
                    throw new Error('Text extraction failed.');
                }
            } else {
                // If already converted, return the stored extracted text
                return extractedTextValue;
            }
        } catch (error) {
            console.error(error);
            alert("Error during text recognition. Please try again.");
        }
    }

    // Image Preview
    image.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageDataUrl = event.target.result;
                if (!imagePreview) {
                    // Create image container dynamically
                    imagePreview = document.createElement('div');
                    imagePreview.className = 'image-container';

                    // Create img element
                    const img = document.createElement('img');
                    img.setAttribute("id", 'imagePreview');
                    imagePreview.appendChild(img);

                    // Append imagePreview above the buttons
                    const container = document.querySelector('.container');
                    container.insertBefore(imagePreview, container.childNodes[4]);
                }
                imagePreview.querySelector('#imagePreview').src = imageDataUrl;
                isConverted = false; // New image is uploaded
            };
            reader.readAsDataURL(file);
        }
    });

    downloadBtn.addEventListener('click', async () => {
        const textToDownload = await convert();
        if (!textToDownload) {
            return;
        }
        let filename = prompt("Enter a filename:");
        while (!filename || filename.trim() === "") {
            alert("Please enter a filename.");
            filename = prompt("Enter a filename:");
        }

        // Create a file with the extracted text and make it downloadable
        const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${filename}.txt`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    convertBtn.addEventListener('click', async () => {
        await convert();
    });
});