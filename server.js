const fs = require('fs');
const http = require('http');
const path = require('path');



let serv = http.createServer((req, res) => {
	if (req.url == "/") {
		req.url = "/index.html";
	}

	let file = path.join(__dirname, req.url);

	if (fs.existsSync(file)) {
		res.statusCode = 200;

		let stream = fs.createReadStream(file);
		stream.pipe(res);
		stream.on('end', res.end);
	} else {
		res.statusCode = 400;
		res.end(`404 cannot find: ${req.url}`);
	}
});

serv.listen(8080);
console.log("http://localhost:8080/")