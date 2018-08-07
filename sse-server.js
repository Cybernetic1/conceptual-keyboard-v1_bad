// New server for Conkey, in Node.js

// TO-DO:
// * alert when new girls arrive
// * ./loadDatabase/:name, Read the latest database_default.##.txt
// * ./saveDatabase/:name

// FIXED:
// * ./speakMandarin/, extra "text=" at beginning of data (fixed in contentscript2, ajax POST)
// * log data is not decoded, with extra "data=" (fixed in contentscript2, ajax POST)
// * log file name = "quick" if name is in Chinese; (added decodeURIComponent)
// * ./saveChatLog/
// * contentscript2 doesn't seem to load for 寻梦园 (add-on is temporary)
// * ./fireFox "data" has '+' instead of spaces (fixed)
// * to be able to output to 寻梦园 at least
// * Strange, double sending /fireFox, why?  And it's always twice...!?
//	 (is it because the login page triggered another copy of contentscript.js?)
//	 (maybe because console.log($.ajax POST...)?)
//   (problem seems disappeared now but I forgot why)
// * how to decide if both Chrome and Firefox have chat windows?
//   (use only Firefox from now...)

var exec = require('child_process').exec;
var cmd = "beep";
exec(cmd, function(err, stdout, stderr) {});

var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");

var sse_res = null;

http.createServer(function (req, res) {

	if (req.headers.accept && req.headers.accept == 'text/event-stream') {
		if (req.url == '/stream') {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});
			res.write("retry: 10000\n");
			res.write("event: connecttime\n");
			// res.write("data: " + (new Date()) + "\n\n");
			// res.write("data: " + (new Date()) + "\n\n");
			res.write(": \n\n");
			res.write(": \n\n");
			// res.end();		// this causes "write after end" error
			sse_res = res;
			console.log("Connected event stream");
		} else {
			res.writeHead(404);
			res.end();
		}
		return;
	}

	var fileName = "";
	var interval;

	if (req.url === "/")
		fileName = "/index.html";
	else
		fileName = req.url;

	if (fileName === "/fireFox") {
		const buffer1 = [];
		req.on('data', chunk => buffer1.push(chunk));
		req.on('end', () => {
			const data1 = Buffer.concat(buffer1);
			if (sse_res != null)
				sse_res.write("data: " + data1 + '\n\n');
			console.log("data: " + data1);
			// console.log(unescape(encodeURIComponent(data)));
		});
		res.end();
		return;	}

	if (fileName.startsWith("/saveChatLog/")) {
		var logname = decodeURIComponent(path.basename(req.url));

		res.writeHead(200, {
				'Content-Type': 'text/event-stream',
			});

		const buffer2 = [];
		req.on('data', chunk => buffer2.push(chunk));
		req.on('end', () => {
			// const data2 = unescape(Buffer.concat(buffer2));
			const data2 = decodeURIComponent(Buffer.concat(buffer2));

			// Save to file
			var fs = require('fs');
			var stream = fs.createWriteStream("./logs/" + logname);
			stream.once('open', function(fd) {
				stream.write(data2);
				stream.end();
			});
			console.log(logname + " saved!");
			// console.log("log data: " + data);
			// console.log(unescape(encodeURIComponent(data)));
		});
		res.end();
		return;	}

	// * from Javascript I get the pinyin sequence
	// * do a shell escape to key in the sequence
	// * return control to Javascript (which then extracts the HTML element from the Google input box)
	if (fileName.startsWith("/keystrokes")) {
		res.writeHead(200, {
				'Content-Type': 'text/event-stream',
			});

		// req.setEncoding("utf8");		// This causes an error, seems chunk cannot be string
		const buffer4 = [];
		req.on('data', chunk => buffer4.push(chunk));
		req.on('end', () => {
			const data4 = Buffer.concat(buffer4);
			const data4b = decodeURIComponent(data4).toString('utf8');
			var exec = require('child_process').exec;
			exec("./keystrokes-into-box.sh " + data4b,
				function (error, stdout, stderr)
					{ console.log(stdout); });
			console.log("sent keystrokes: " + data4b);
			// console.log("scraping data: " + data3b);
			// console.log(unescape(encodeURIComponent(data3b)));
		});
		res.end();
		return;	}

	if (fileName.startsWith("/speakMandarin")) {
		res.writeHead(200, {
				'Content-Type': 'text/event-stream',
			});

		// req.setEncoding("utf8");		// This causes an error, seems chunk cannot be string
		const buffer3 = [];
		req.on('data', chunk => buffer3.push(chunk));
		req.on('end', () => {
			const data3 = Buffer.concat(buffer3);
			const data3b = decodeURIComponent(data3).toString('utf8');
			var exec = require('child_process').exec;
			exec("ekho " + data3b,
				function (error, stdout, stderr)
					{ console.log(stdout); });
			console.log("Speak: " + data3b);
			// console.log("log data: " + data3b);
			// console.log(unescape(encodeURIComponent(data3b)));
		});
		res.end();
		return;	}

	if (fileName.startsWith("/saveDatabase/")) {
		var pathname = url.parse(req.url).pathname;

		res.writeHead(200, {
				'Content-Type': 'text/event-stream',
			});

		const buffer4 = [];
		req.on('data', chunk => buffer4.push(chunk));
		req.on('end', () => {
			const data4 = Buffer.concat(buffer4);

			// Save to file
			var fs = require('fs');
			var stream = fs.createWriteStream("./web/database_default.txt");
			stream.once('open', function(fd) {
				stream.write(data4);
				stream.end();
			});
			console.log(pathname + " saved!");
			// console.log("log data: " + data4);
			// console.log(unescape(encodeURIComponent(data4)));
		});
		res.end();
		return;	}

	if (fileName.startsWith("/loadDatabase/")) {
		var dbName = path.basename(url.parse(req.url).pathname);
		console.log("DB name = " + dbName);

		res.writeHead(200, {
			"Content-Type":"text/html",
			"Cache-Control":"no-cache",
			"Connection":"keep-alive"
			});

		fs = require('fs');
		fs.readFile("./web/" + dbName + ".txt", "utf-8", function (err, data) {
			if (err) {
				return console.log(err);
			}
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(data, "utf-8");
		});
		return; }

	if (fileName.startsWith("/appendFile/")) {
		res.writeHead(200, {
				'Content-Type': 'text/event-stream',
			});

		const buffer5 = [];
		req.on('data', chunk => buffer5.push(chunk));
		req.on('end', () => {
			const data5 = Buffer.concat(buffer5);

			// Save to file
			var fs = require('fs');
			var stream = fs.appendFile("./web/scraped-Google.txt", data5, function (err) {
				if (err)
					throw err;
				console.log("File appended!");
			});
		});
		res.end();
		return;	}

	fileName = "./web" + fileName;

	if (fileName.endsWith(".html") || fileName.endsWith(".htm")
		|| fileName.endsWith(".js")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"text/html"});
						res.end(content, "utf-8");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	if (fileName.endsWith(".ogg")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, 'base64', function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"audio/ogg"});
						res.end(content, "base64");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	if (fileName.endsWith(".ico")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, 'base64', function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"image/x-icon"});
						res.end(content, "base64");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	if (fileName.endsWith(".jpg")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, 'base64', function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"image/jpg"});
						res.end(content, "base64");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	if (fileName.endsWith(".png")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, 'base64', function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"image/png"});
						res.end(content, "base64");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	if (fileName.endsWith(".gif")) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, 'base64', function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type":"image/gif"});
						res.end(content, "base64");
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		return; }

	// All failed:
	res.writeHead(404);
	res.end();

}).listen(8484, "127.0.0.1");
console.log("Server running at http://127.0.0.1:8484/");
