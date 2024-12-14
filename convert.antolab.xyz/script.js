document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const downloadButton = document.getElementById('downloadButton');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const imageContainer = document.getElementById('imageContainer');
  
    // Prevent default drag and drop behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
  
    // Highlight dropzone on drag
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, highlight, false);
    });
  
    // Remove highlight on leave or drop
    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, unhighlight, false);
    });
  
    // Event listeners for file selection methods
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
  
    function updateProgress(progress) {
      progressBar.style.width = `${progress}%`;
      if (progress === 100) {
        setTimeout(() => {
          progressContainer.style.display = 'none';
        }, 500);
      }
    }
  
    function handleFileSelect(file) {
      if (!file) return;
  
      // Reset UI
      progressContainer.style.display = 'block';
      updateProgress(0);
      downloadButton.disabled = true;
      
      // Clear previous image
      imageContainer.innerHTML = '';
  
      // Check file type and convert accordingly
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
  
      if (fileType.startsWith('image/') || 
          fileName.endsWith('.jpg') || 
          fileName.endsWith('.jpeg') || 
          fileName.endsWith('.png') || 
          fileName.endsWith('.gif') || 
          fileName.endsWith('.webp')) {
        convertStandardImage(file);
      } else if (fileName.endsWith('.heic')) {
        convertHEICImage(file);
      } else {
        alert('Unsupported file type. Please upload an image.');
        progressContainer.style.display = 'none';
      }
    }
  
    function convertStandardImage(file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // Create and display image
        const originalImage = new Image();
        originalImage.onload = function() {
          // Add image to container only after it's loaded
          imageContainer.appendChild(originalImage);
  
          // Simulate conversion progress
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            updateProgress(progress);
            
            if (progress >= 100) {
              clearInterval(progressInterval);
              
              // Convert to PNG using a Promise to handle loading
              convert_to_png(originalImage).then(canvas => {
                downloadButton.canvas = canvas;
                downloadButton.disabled = false;
              }).catch(error => {
                console.error('Conversion error:', error);
                alert('Error converting image. Please try again.');
              });
            }
          }, 100);
        };
  
        // Handle image load errors
        originalImage.onerror = function() {
          alert('Error loading image. Please try a different file.');
          progressContainer.style.display = 'none';
        };
  
        // Set the source after setting up load handlers
        originalImage.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
    }
  
    async function convertHEICImage(file) {
      // Fallback warning if conversion fails
      const fallbackConversion = () => {
        alert('HEIC conversion is not supported in this browser. Please use a desktop application or online converter.');
        progressContainer.style.display = 'none';
        return;
      };
  
      // Check for Dynamsoft HEIC Converter
      if (typeof heic !== 'undefined') {
        try {
          // Use Dynamsoft HEIC Converter
          heic.convertToJPEG(file, (result) => {
            const reader = new FileReader();
            reader.onload = function(e) {
              const convertedImage = new Image();
              convertedImage.onload = function() {
                imageContainer.appendChild(convertedImage);
  
                // Simulate conversion progress
                let progress = 0;
                const progressInterval = setInterval(() => {
                  progress += 10;
                  updateProgress(progress);
                  
                  if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Create canvas for download
                    const canvas = document.createElement('canvas');
                    canvas.width = convertedImage.naturalWidth;
                    canvas.height = convertedImage.naturalHeight;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(convertedImage, 0, 0, canvas.width, canvas.height);
                    
                    downloadButton.canvas = canvas;
                    downloadButton.disabled = false;
                  }
                }, 100);
              };
  
              convertedImage.src = e.target.result;
            };
            reader.readAsDataURL(result);
          }, (error) => {
            console.error('HEIC conversion error:', error);
            fallbackConversion();
          });
        } catch (error) {
          console.error('HEIC conversion error:', error);
          fallbackConversion();
        }
      } else {
        fallbackConversion();
      }
    }
  
    function convert_to_png(image) {
      return new Promise((resolve, reject) => {
        // Create a canvas element to convert the image
        const canvas = document.createElement('canvas');
        
        // Ensure image is fully loaded
        if (image.complete && image.naturalWidth !== 0) {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          
          // Get the 2D rendering context
          const ctx = canvas.getContext('2d');
          
          // Draw the image onto the canvas
          try {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
          } catch (error) {
            reject(error);
          }
        } else {
          // If image isn't loaded, wait for it to load
          image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
          };
          
          image.onerror = () => {
            reject(new Error('Image could not be loaded'));
          };
        }
      });
    }
  
    downloadButton.addEventListener('click', () => {
      if (!downloadButton.canvas) return;
  
      const dataURL = downloadButton.canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = 'converted_image.png';
      link.href = dataURL;
      link.click();
    });
});