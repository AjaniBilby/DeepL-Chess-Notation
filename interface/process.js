let opts = [
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
	"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R"
];

function Canny_Edge(grey) {
	let dst = new cv.Mat();
	cv.Canny(grey, dst, 50, 100, 3, false);
	// cv.Canny(grey, dst, 50, 100, 3, false);
	return dst;
}

function Hough_Lines(edges) {
	const min_line_length = 400;
	const max_line_gap = 20;

	let lines = new cv.Mat();
	cv.HoughLines(
		edges,
		lines,
		1,
		Math.PI / 180,
		125,
		min_line_length,
		max_line_gap
	);

	return lines;
}

function Line_Intersections (horizontal, vertical) {
	let points = [];
	for (let h of horizontal) {
		for (let v of vertical) {
			if (h[0] == v[0]) {
				continue;
			}

			let x = (v[1]-h[1]) / (h[0]-v[0]);
			let y = h[0] * x + h[1];
			points.push([x, y]);
		}
	}

	// return points;
	return points.filter(p =>
		p[0] >= 0 && p[0] <= canvas.width &&
		p[1] >= 0 && p[1] <= canvas.height
	);
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
		let startPoint = {x: x0 - 2000 * b, y: y0 + 2000 * a};
		let endPoint = {x: x0 + 2000 * b, y: y0 - 2000 * a};
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


function Line_Polar2Cart (line) {
	return [
		-(Math.cos(line[1])/Math.sin(line[1])),
		line[0] / Math.sin(line[1])
	];
}


function DrawPoints(points) {
	ctx.fillStyle = "red";
	for (let point of points) {
		ctx.beginPath();
		ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function Distance2(a, b) {
	let dx = a[0] - b[0];
	let dy = a[1] - b[1];

	return dx*dx + dy*dy;
}

function Cluster(points) {
	const THREASH_HOLD = 10**2;


	let acted = true;
	while (acted) {
		acted = false;

		for (let i=0; i<points.length; i++) {
			let best = null;
			for (let j=i+1; j<points.length; j++) {
				let dist = Distance2(points[i], points[j]);

				if (dist < THREASH_HOLD && (
					best == null || best.dist > dist
				)) {
					best = {dist: dist, point: points[j], index: j};
				}
			}

			if (best) {
				points[i][0] = (points[i][0] + points[i][0]) / 2;
				points[i][1] = (points[i][1] + points[i][1]) / 2;
				points.splice(best.index, 1);
				acted = true;
			}
		}

	}

	return points;
}

function ClusterBatch(points) {
	const THREASH_HOLD = 5**2;
	function Distance2(a, b) {
		let dx = a[0] - b[0];
		let dy = a[1] - b[1];

		return dx*dx + dy*dy;
	}

	let acted = true;
	while (acted) {
		acted = false;

		for (let i=0; i<points.length; i++) {
			let near = [];
			for (let j=i+1; j<points.length; j++) {
				let dist = Distance2(points[i], points[j]);
				if (dist < 1) {
					near.push([points[j][0], points[j][0], j]);
				}
			}

			if (near.length > 1) {
				points[i][0] = points[i][0] + near.map(p => p[0]).reduce((prev, curr) => prev+curr, 0);
				points[i][0] /= near.length + 1;
				points[i][1] = points[i][1] + near.map(p => p[0]).reduce((prev, curr) => prev+curr, 0);
				points[i][1] /= near.length + 1;

				for (let point of near) {
					points.splice(point[2], 1);
				}
				acted = true;
			}
		}

	}

	return points;
}


function GetAugmentHandles(points) {
	const cr_tl = [0,                        0];
	const cr_tr = [canvas.width,             0];
	const cr_bl = [0           , canvas.height];
	const cr_br = [canvas.width, canvas.height];

	let top_left     = points[0];
	let top_right    = points[0];
	let bottom_left  = points[0];
	let bottom_right = points[0];
	let top_left_dist     = Distance2(top_left, cr_tl);
	let top_right_dist    = Distance2(top_right, cr_tr);
	let bottom_left_dist  = Distance2(bottom_left, cr_bl);
	let bottom_right_dist = Distance2(bottom_right, cr_br);


	for(let i=0; i<points.length; i++) {
		let tl_dist = Distance2(cr_tl, points[i]);
		let tr_dist = Distance2(cr_tr, points[i]);
		let bl_dist = Distance2(cr_bl, points[i]);
		let br_dist = Distance2(cr_br, points[i]);

		if (tl_dist < top_left_dist) {
			top_left_dist = tl_dist;
			top_left = points[i];
		}
		if (tr_dist < top_right_dist) {
			top_right_dist = tr_dist;
			top_right = points[i];
		}
		if (bl_dist < bottom_left_dist) {
			bottom_left_dist = bl_dist;
			bottom_left = points[i];
		}
		if (br_dist < bottom_right_dist) {
			bottom_right_dist = br_dist;
			bottom_right = points[i];
		}
	}

	return [top_left, top_right, bottom_left, bottom_right];
}


async function GetAutoAugmentPoints(canvas) {
	// Grey scale the image
	let grey = cv.imread(canvas, 0);
	cv.cvtColor(grey, grey, cv.COLOR_RGB2GRAY, 0);

	// Apply canny edge detection
	console.info("Processing Canny Edge...");
	let edges = Canny_Edge(grey);
	cv.imshow(canvas, edges);
	await WaitTime(2000);

	// Find the lines within the edges
	console.info("Processing Hought Lines...");
	let linesMat = Hough_Lines(edges);
	Draw_Lines(linesMat, grey);
	cv.imshow(canvas, grey);
	console.log("  lines:", linesMat);
	await WaitTime(2000);

	// Find the intersection of lines
	console.info("Processing Intersections...");
	let lines = h_v_lines(linesMat);
	lines.horizontal = lines.horizontal.map(Line_Polar2Cart);
	lines.vertical = lines.vertical.map(Line_Polar2Cart);
	points = Line_Intersections(lines.horizontal, lines.vertical);
	DrawPoints(points);
	await WaitTime(2000);

	// Cluster the points
	console.info("Processing Point Clusters...");
	points = Cluster(points);
	cv.imshow(canvas, grey);
	DrawPoints(points);
	await WaitTime(2000);

	// Get handles
	console.info("Processing Augmension Handles...");
	let handles = GetAugmentHandles(points);


	// Memory management
	// Deallocated native data
	grey.delete();
	edges.delete();
	linesMat.delete();

	return handles;
}