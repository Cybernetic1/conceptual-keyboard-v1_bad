// **** Check if Chinese characters are displayed properly ****

// TO-DO:

// DONE:
// * capture image of unrecognized char, for comparison

var canvas = document.getElementById('test');
var ctx = canvas.getContext('2d');

ctx.font = '200px serif';
const charbox = [50, 13, 210, 210];
// For Chromium:
// const outer = [77, 74, 101, 126];
// const inner = [81, 78, 93, 118];
// For Firefox
const outer = [50, 13, 127, 188];
const inner = [52, 15, 123, 184];
//const inner = [57, 20, 113, 174];

// Uncomment the following for testing:
/*
// c = String.fromCharCode(18799);
c = "𫜨"; // 𫜨
ctx.fillStyle = 'rgba(255, 255, 255, 1)';
ctx.font = '200px serif';
ctx.fillText(c + '<', 50, 200);

console.log("test char code = ", c.charCodeAt(0));

// Use these rectangles to locate the character region:

ctx.fillStyle = 'rgba(200, 0, 0, .5)';
//ctx.fillRect.apply(ctx, outer);				// outer box

ctx.fillStyle = 'rgba(0, 0, 200, .5)';
//ctx.fillRect.apply(ctx, inner);				// inner box

var i = ctx.getImageData.apply(ctx, outer);
var colored = 0;
i.data.forEach(function(p) {
	if (p != 0)
		colored += 1;
	});
console.log("Outer, total = ", colored);

var i = ctx.getImageData.apply(ctx, inner);
var colored = 0;
i.data.forEach(function(p) {
	if (p != 0)
		colored += 1;
	});
console.log("Inner, total = ", colored);
*/
// alert("test");

ctx.fillStyle = 'rgba(255, 255, 255, 1)';

var chars = [];

function read_chars() {
	fname = document.getElementById("filename").value;
	$.ajax({
	method: "GET",
	url: "/loadDatabase/" + fname,		// Note: use filename with extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");
		lines.forEach(function(line) {
			if (line[0] == '/')
				return;
			chars.push(line[0]);
			});
		console.log("Loaded", fname);
		document.getElementById("total").innerText = "/" + (chars.length -1).toString();
		const audio = new Audio("sending.ogg");
		audio.play();
		}});
	}
document.getElementById("read").addEventListener("click", read_chars);

document.getElementById("play").addEventListener("click", function() {stop = false; play();});
document.getElementById("stop").addEventListener("click", function() {stop = true;});

document.getElementById("inc").addEventListener("click", function() {num.value = (parseInt(num.value) + 1).toString(); dochar();});
document.getElementById("dec").addEventListener("click", function() {num.value = (parseInt(num.value) - 1).toString(); dochar();});

code = document.getElementById("code");
num = document.getElementById("num");
range = document.getElementById("range");
num.value = "0";
range.value = num.value;

num.addEventListener("change", function() {range.value = num.value; dochar();});

$('#range').mousemove(function(){
    num.value = range.value;
    dochar();
});

var stop = false;
var last_c = '';

function play() {
	i = parseInt(num.value);
	last_c = chars[i];

	dochar();

	if (i >= chars.length)
		stop = true;
	if (last_c === undefined)
		stop = true;

	if (!stop) {
		do {
			i += 1;
			}
		while (chars[i] === last_c);
		num.value = i.toString();
		range.value = num.value;
		setTimeout(play, 1);
		}
	}

var found = [];
num_found = document.getElementById("found");

var captured_img = null;
function capture() {
	// const charbox = [50, 13, 210, 210];
	// For testing, uncomment the following:
	// ctx.fillStyle = 'rgba(255, 0, 0, .5)';
	// ctx.fillRect.apply(ctx, charbox);
	captured_img = ctx.getImageData.apply(ctx, charbox);
	console.log("Captured char image for comparison.");
	const audio = new Audio("sending.ogg");
	audio.play();
	}
document.getElementById("capture").addEventListener("click", capture);

function cmp_images(img1, img2) {
	var sum = 0;
	for (var i = 0; i <= img1.data.length - 1; i++)
		sum += Math.abs(img1.data[i] - img2.data[i]);
	// console.log("the diff =", sum);
	return sum;
	}

function dochar() {
	var i = parseInt(num.value);
	var c = chars[i];
	if (c === undefined)
		return
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillText(c, 50, 200);

	code.textContent = c.charCodeAt(0).toString(16);

	// 2 methods of testing for non-printable chars:
	// 1) first method uses image comparison
	if (captured_img !== null) {
		const img = ctx.getImageData.apply(ctx, charbox);
		const diff = cmp_images(img, captured_img);
		if (diff < 90000) {
			found.push(i.toString() + escape(c));
			num_found.innerText = found.length.toString();
			console.log(i, c, diff);
			// alert("found!");
			}
		// console.log(i, c, diff);
		}
	// 2) second method uses counting of pixels
	else {
		const img1 = ctx.getImageData.apply(ctx, outer);
		var n_out = 0;
		img1.data.forEach(function(p) {
			if (p != 0)
				n_out += 1;
			});

		var img2 = ctx.getImageData.apply(ctx, inner);
		var n_in = 0;
		img2.data.forEach(function(p) {
			if (p != 0)
				n_in += 1;
			});

		if (n_in < 500) {
			found.push(i.toString() + escape(c));
			num_found.innerText = found.length.toString();
			console.log(i, c, n_out, n_in);
			// alert("found!");
			}
		}
	}

document.getElementById("save").addEventListener("click", function() {
	$.ajaxSettings.mimeType="*/*; charset=UTF-8";	// set you charset
	// ^^^ This seems useless.
	// No matter what I try, I can't export the UTF8 unicodes to file.
	// Problem seems to be in SSE-server.js.
	// Up to this point I have the correct unicodes.

	$.ajax({
	method: "POST",
	url: "/saveDatabase/" + "undisplayable-chars.txt",
	data: found.join('\n'),
	success: function(resp) {
		console.log("Saved found[] to file.");
		const audio = new Audio("sending.ogg");
		audio.play();
		}
	});
});

