function DisableUI(active = true) {
	if (active) {
		fileInput.setAttribute('disabled', true);
		results.setAttribute('disabled', true);
		manual.setAttribute('disabled', true);
		clear.setAttribute('disabled', true);
	} else {
		fileInput.removeAttribute('disabled');
		results.removeAttribute('disabled');
		manual.removeAttribute('disabled');
		clear.removeAttribute('disabled');
	}
}

let manual;
let fileInput;
let canvas;
let ctx;
let results;
let reader;
let clear;
let img;


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
				Augment(canvas, img)
					.then(Process)
					.catch((err) => {
						console.error(err);
						alert("An Error has occured");
					});
			};
		};

		reader.readAsDataURL(fileInput.files[0]);
	});

	// Get the results element
	results = document.getElementById('results');

	manual = document.getElementById("manual");

	clear = document.getElementById("clear");

	// Black out canvas input
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	ctx.fillStyle = "black";
	ctx.fillRect(0,0, canvas.width, canvas.height);

	// Bind the clear behaviour
	clear.addEventListener('click', () => {
		results.innerText = "";
	});


	DisableUI(true);
	LoadNetwork().then(()=>{
		DisableUI(false);
	});
});