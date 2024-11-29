document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const originalImage = document.getElementById('originalImage');
    const processedCanvas = document.getElementById('processedCanvas');
    const downloadButton = document.getElementById('downloadButton');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

    dropzone.addEventListener('drop', handleDrop, false);

    fileInput.addEventListener('change', handleFiles, false);

    dropzone.addEventListener('click', () => fileInput.click());

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropzone.classList.add('highlight');
    }

    function unhighlight() {
        dropzone.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFileSelect(files[0]);
    }

    function handleFiles() {
        handleFileSelect(fileInput.files[0]);
    }

    function handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.onload = () => processImage(originalImage);
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function loadModel() {
        try {
            const net = await bodyPix.load();
            return net;
        } catch (error) {
            console.error('Failed to load BodyPix model:', error);
            alert('Failed to load image processing model. Please try again.');
            return null;
        }
    }

    async function processImage(imageElement) {
        try {
            const net = await loadModel();
            if (!net) return;

            const ctx = processedCanvas.getContext('2d');
            const width = imageElement.width;
            const height = imageElement.height;

            processedCanvas.width = width;
            processedCanvas.height = height;

            const segmentation = await net.segmentPerson(imageElement);
            const backgroundRemoved = bodyPix.toMask(segmentation);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(imageElement, 0, 0);
            
            let imageData = ctx.getImageData(0, 0, width, height);
            for (let i = 0; i < width * height * 4; i += 4) {
                if (backgroundRemoved.data[i + 3] === 255) {
                    imageData.data[i + 3] = 0;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
        } catch (error) {
            console.error('Image processing error:', error);
            alert('Failed to process image. Please try again.');
        }
    }

    downloadButton.addEventListener('click', () => {
        const dataURL = processedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'background-removed.png';
        link.href = dataURL;
        link.click();
    });
});