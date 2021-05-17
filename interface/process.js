let opts = [
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
	"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R"
];

function Canny_Edge(grey) {
	let dst = new cv.Mat();
	cv.Canny(grey, dst, 50, 100, 3, false);
	return dst;
}

function Hough_Lines(edges, min_line_length=100, max_line_gap=10) {
	let lines = new cv.Mat();
	cv.HoughLines(
		edges,
		lines,
		1,
		Math.PI / 180,
		125,
		min_line_length,
		max_line_gap
	)

	return lines;
}

function Draw_Lines(lines, dst) {
	// draw lines
	for (let i = 0; i < lines.rows; ++i) {
		let rho = lines.data32F[i * 2];
		let theta = lines.data32F[i * 2 + 1];
		let a = Math.cos(theta);
		let b = Math.sin(theta);
		let x0 = a * rho;
		let y0 = b * rho;
		let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
		let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
		cv.line(dst, startPoint, endPoint, [255, 0, 0, 255]);
	}
}

function h_v_lines(lines) {
	let horizontal = [];
	let vertical = [];

	// draw lines
	for (let i = 0; i < lines.rows; ++i) {
		let rho = lines.data32F[i * 2];
		let theta = lines.data32F[i * 2 + 1];
		if (theta < Math.PI / 4 || theta > Math.PI - Math.PI/4) {
			vertical.push([rho, theta]);
		} else {
			horizontal.push([rho, theta]);
		}
	}

	return {
		horizontal: horizontal.sort((a, b) => a[0] - b[0]),
		vertical: vertical.sort((a, b) => a[0] - b[0])
	};
}

function Process(canvas) {

	let src = cv.imread(canvas, 0);

	let grey = src.clone();
	cv.cvtColor(grey, grey, cv.COLOR_RGB2GRAY, 0);

	let edges = Canny_Edge(grey);
	cv.imshow(canvas, edges);

	let lines = Hough_Lines(edges);


	Draw_Lines(lines, grey);
	cv.imshow(canvas, grey);

	console.log(39, h_v_lines(lines));


	src.delete();
	edges.delete();
	grey.delete();
	lines.delete();

	// DisableUI(true);
	// setTimeout(()=>{
	// 	let move = opts[Math.floor(Math.random()*opts.length)];

	// 	results.innerHTML = results.value + move + "&#13;&#10;";
	// 	DisableUI(false);
	// }, 1000);
}