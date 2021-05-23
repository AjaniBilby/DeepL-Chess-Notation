function OnClick(elm) {
	return new Promise((res, rej) => {
		let bind = (evt) => {
			elm.removeEventListener('click', bind);
			res(evt);
		};

		elm.addEventListener('click', bind);
	});
}


function OrderPoints(points) {
	points = points.sort((a, b) => a[0] - b[0]);
	let left = points.slice(0, 2).sort((a, b) => a[1] - b[1]);
	let right = points.slice(2, 4).sort((a, b) => a[1] - b[1]);

	return [
		left[0], right[0], left[1], right[1]
	];
}

function GetPointBounds(points) {
	let xs = points.map(p => p[0]);
	let ys = points.map(p => p[1]);

	return [
		[Math.min.apply(Math, xs), Math.min.apply(Math, ys)], // top left
		[Math.max.apply(Math, xs), Math.max.apply(Math, ys)], // bottom right
	];
}


async function GetManualAugmentPoints(canvas) {
	ctx.fillStyle = "red";

	let adjustX = canvas.width / canvas.offsetWidth;
	let adjustY = canvas.height / canvas.offsetHeight;

	let points = [];
	for (let i=0; i<4; i++) {
		let evt = await OnClick(canvas);
		let x = evt.layerX * adjustX;
		let y = evt.layerY * adjustY;

		ctx.beginPath();
		ctx.arc(x, y, 10, 0, 2 * Math.PI);
		ctx.fill();

		points.push([x, y]);
	}

	points = OrderPoints(points);
	return points;
}



async function Augment(canvas) {
	DisableUI(true);
	let src = cv.imread(canvas, 0);

	let points;
	if (manual_augmentation) {
		points = await GetManualAugmentPoints(canvas);
	} else {
		points = await GetAutoAugmentPoints(canvas);
	}

	let dst = new cv.Mat();
	let dsize = new cv.Size(src.rows, src.cols);
	let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
		points[0][0], points[0][1],
		points[1][0], points[1][1],
		points[2][0], points[2][1],
		points[3][0], points[3][1],
	]);
	let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
		0,        0,
		src.rows, 0,
		0,        src.cols,
		src.rows, src.cols
	]);
	let M = cv.getPerspectiveTransform(srcTri, dstTri);
	cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
	cv.imshow(canvas, dst);
	src.delete();
	dst.delete();
	M.delete();
	srcTri.delete();
	dstTri.delete();

	DisableUI(false);
}