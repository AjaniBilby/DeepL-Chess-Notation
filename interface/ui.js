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
				Process();
			};
		};

		reader.readAsDataURL(fileInput.files[0]);
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
});