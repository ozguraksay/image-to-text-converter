document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('fileInput');
    const convert_btn = document.getElementById('convert_btn');
    const download_btn = document.getElementById('download_btn');
    const image_preview = document.getElementById('imagePreview');
    const extracted_text = document.getElementById('result');

    let imageDataUrl = '';

    async function convert() {
        try {
            if (!imageDataUrl) {
                alert("Upload an image!");
                return;
            }

            // Use Tesseract to recognize text in the displayed image
            const { data: { text } } = await Tesseract.recognize(
                image_preview, 'eng', 
                { logger: m => console.log(m) 
            });
            //console.log(text);

            // Display the extracted text in a div
            if (text) {
                extracted_text.textContent = text;
                return text;
            } else {
                alert('Text extraction failed.')
                throw new Error('Text extraction failed.');
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
                image_preview.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        }
    });

    download_btn.addEventListener('click', async () => {
        const extractedText = await convert();
        if (!extractedText) {
            return;
        }
        let filename = prompt("Enter a filename:");
        while (!filename || filename.trim() === "") {
            alert("Please enter a filename.");
            filename = prompt("Enter a filename:");
        }

        // Create a file with the extracted text and make it downloadable
        const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${filename}.txt`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    convert_btn.addEventListener('click', async () => {
        await convert();
    });
});