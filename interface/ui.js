function DisableUI(active = true) {
	if (active) {
		fileInput.setAttribute('disabled', true);
		results.setAttribute('disabled', true);
	} else {
		fileInput.removeAttribute('disabled');
		results.removeAttribute('disabled');
	}
}

let fileInput;
let canvas;
let ctx;
let results;
let reader;
let img;
let manual_augmentation;


function WaitTime(delay) {
	return new Promise((res, rej) => {
		setTimeout(res, delay)
	});
}


window.addEventListener('load', () => {
	// Prepare the file input bindings
	fileInput = document.getElementById("fileInput");
	fileInput.addEventListener('change', () => {
		reader = new FileReader();
		img = new Image();

		reader.onloadend = () => {
			img.src = reader.result;
			img.onload = () => {
				ctx.drawImage(img,0,0, canvas.width, canvas.height);
				Augment(canvas);
				// Process(canvas);
			};
		};

		console.log(33, fileInput.files[0]);
		reader.readAsDataURL(fileInput.files[0]);
	});

	document.getElementById("manual").addEventListener('click', (evt) => {
		manual_augmentation = evt.target.checked;
	});

	// Get the results element
	results = document.getElementById('results');

	// Black out canvas input
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	ctx.fillStyle = "black";
	ctx.fillRect(0,0, canvas.width, canvas.height);

	// Bind the clear behaviour
	document.getElementById('clear').addEventListener('click', () => {
		results.innerText = "";
	});


	// TEST
	// console.log('DEBUG')
	// img = new Image();
	// img.src = "./sample-image.JPG";
	// img.onload = () => {
	// 	ctx.drawImage(img,0,0, canvas.width, canvas.height);
	// 	// Augment(canvas);
	// 	Process(canvas);
	// };
});