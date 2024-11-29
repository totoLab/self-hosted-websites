async function loadModel() {
	const net = await bodyPix.load();
	return net;
}
let backgroundRemoved;
async function processImage() {
	const imageElement = document.getElementById('image');
	const canvas = document.getElementById('out');
	const ctx = canvas.getContext('2d');

	const width = imageElement.width;
	const height = imageElement.height;
	canvas.width = width;
	canvas.height = height;

	const net = await loadModel();
	const segmentation = await net.segmentPerson(imageElement);
	backgroundRemoved = bodyPix.toMask(segmentation);

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(imageElement, 0, 0);
	
	let imageData = ctx.getImageData(0, 0, width, height);
	for (i = 0; i < width * height * 4; i += 4) {
		if (backgroundRemoved.data[i + 3] === 255) {
			imageData.data[i + 3] = 0;
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

document.getElementById('uploadImage').addEventListener('change', (event) => {
	const file = event.target.files[0];
	const reader = new FileReader();

	reader.onload = function (e) {
		const img = document.getElementById('image');
		img.onload = function () {
			processImage(); 
		};
		img.src = e.target.result;
	};
	reader.readAsDataURL(file);
});