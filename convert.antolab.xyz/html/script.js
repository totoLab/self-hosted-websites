document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const downloadButton = document.getElementById('downloadButton');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const imageContainer = document.getElementById('imageContainer');

  // Utility functions
  const preventDefaults = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const highlight = () => dropzone.classList.add('highlight');
  const unhighlight = () => dropzone.classList.remove('highlight');

  const updateProgress = progress => {
    progressBar.style.width = `${progress}%`;
    if (progress === 100) {
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 500);
    }
  };

  const resetUI = () => {
    progressContainer.style.display = 'block';
    updateProgress(0);
    downloadButton.disabled = true;
    imageContainer.innerHTML = '';
  };

  // Drag and drop events
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

  dropzone.addEventListener('drop', e => handleFileSelect(e.dataTransfer.files[0]), false);
  fileInput.addEventListener('change', () => handleFileSelect(fileInput.files[0]), false);
  dropzone.addEventListener('click', () => fileInput.click());

  const handleFileSelect = file => {
    if (!file) return;

    resetUI();

    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    if (fileName.endsWith('.heic')) {
      convertHEICImage(file);
    } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      convertStandardImage(file);
    } else {
      alert('Unsupported file type. Please upload an image.');
      progressContainer.style.display = 'none';
    }
  };

  const convertStandardImage = file => {
    const reader = new FileReader();

    reader.onload = e => {
      const image = new Image();

      image.onload = () => {
        imageContainer.appendChild(image);
        simulateProgress(() => convertToPNG(image));
      };

      image.onerror = () => {
        alert('Error loading image. Please try a different file.');
        progressContainer.style.display = 'none';
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const convertHEICImage = async file => {
    try {
      const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
      const reader = new FileReader();

      reader.onload = e => {
        const image = new Image();

        image.onload = () => {
          imageContainer.appendChild(image);
          simulateProgress(() => convertToPNG(image));
        };

        image.onerror = () => {
          alert('Error displaying the converted image. Please try again.');
          progressContainer.style.display = 'none';
        };

        image.src = e.target.result;
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('HEIC conversion error:', error);
      alert('Error converting HEIC file. Please try again.');
      progressContainer.style.display = 'none';
    }
  };

  const simulateProgress = callback => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        callback().then(canvas => {
          downloadButton.canvas = canvas;
          downloadButton.disabled = false;
        }).catch(error => {
          console.error('Conversion error:', error);
          alert('Error converting image. Please try again.');
        });
      }
    }, 100);
  };

  const convertToPNG = image => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');

      try {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    });
  };

  downloadButton.addEventListener('click', () => {
    if (!downloadButton.canvas) return;

    const dataURL = downloadButton.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'converted_image.png';
    link.href = dataURL;
    link.click();
  });
});
