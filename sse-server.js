// New server for Conkey, in Node.js

// TO-DO:
// * ./fireFox "data" has '+' instead of spaces
// * contentscript2 doesn't seem to load for 寻梦园
// * how to decide if both Chrome and Firefox have chat windows?
// * ./loadDatabase/:name, Read the latest database_default.##.txt
// * ./saveDatabase/:name
// * ./speakMandarin/
// * ./saveChatLog/

var exec = require('child_process').exec;
var cmd = "beep";
exec(cmd, function(err, stdout, stderr) {});

var http = require("http");
var fs = require("fs");

var eventResp = null

http.createServer(function (req, res) {
	var fileName = "";
	var interval;

	if (req.url === "/")
		fileName = "/index.html";
	else
		fileName = req.url;

	if (fileName === "/stream") {
		res.writeHead(200, {"Content-Type":"text/event-stream", "Cache-Control":"no-cache",
			"Connection":"keep-alive"});
		res.write("retry: 10000\n");
		res.write("event: connecttime\n");
		res.write("data: " + (new Date()) + "\n\n");
		res.write("data: " + (new Date()) + "\n\n");
		eventResp = res;
		return; }
	
	if (fileName === "/fireFox") {
		const chunks = [];
		req.on('data', chunk => chunks.push(chunk));
		req.on('end', () => {
			const data = Buffer.concat(chunks);
			eventResp.write("data: " + data + "\n\n");
		});
		return;	}
		
	if (fileName.startsWith("/loadDatabase/")) {
		res.writeHead(200, {"Content-Type":"text/html", "Cache-Control":"no-cache",
			"Connection":"keep-alive"});
		fs = require('fs');
		fs.readFile("./web/database_default.47.txt", "utf-8", function (err, data) {
			if (err) {
				return console.log(err);
			}
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(data, "utf-8");
		});
		return; }
	
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

}).listen(8080, "127.0.0.1");
console.log("Server running at http://127.0.0.1:8080/");
