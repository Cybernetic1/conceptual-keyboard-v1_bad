// **** Read YKY custom pinyins file ****

var canvas = document.getElementById('test');
var ctx = canvas.getContext('2d');

ctx.font = '200px serif';
// const outer = [77, 74, 101, 126];
// const inner = [81, 78, 93, 118];
const outer = [50, 13, 127, 188];
const inner = [52, 15, 123, 184];
//const inner = [57, 20, 113, 174];

// c = String.fromCharCode(18799);
c = "𫜨"; // 𫜨
ctx.fillStyle = 'rgba(255, 255, 255, 1)';
ctx.font = '200px serif';
ctx.fillText(c + '<', 50, 200);

console.log(c.charCodeAt(0));

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

// alert("test");

ctx.fillStyle = 'rgba(255, 255, 255, 1)';

chars = [];

$.ajax({
method: "GET",
url: "/loadDatabase/YKY-custom-pinyins-ZH",		// Note: use filename without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		if (line[0] == '/')
			return;
		chars.push(line[0]);
		});
	console.log("Loaded YKY-custom-pinyins-ZH.txt\n");
}});

document.getElementById("play").addEventListener("click", function() {stop = false; play();});
document.getElementById("stop").addEventListener("click", function() {stop = true;});

document.getElementById("inc").addEventListener("click", function() {num.value = (parseInt(num.value) + 1).toString(); dochar();});
document.getElementById("dec").addEventListener("click", function() {num.value = (parseInt(num.value) - 1).toString(); dochar();});

document.getElementById("num").addEventListener("change", function() {range.value = num.value; dochar();});

code = document.getElementById("code");
num = document.getElementById("num");
range = document.getElementById("range");
num.value = "159";
range.value = num.value;

$('#range').mousemove(function(){
    num.value = range.value;
    dochar();
});

var stop = false;
var last_c = '';

function play() {
	i = parseInt(num.value);
	while (chars[i] === last_c)
		i += 1;
	last_c = chars[i];
	num.value = i.toString();
	range.value = num.value;

	dochar();

	if (i >= (chars.length - 1))
		stop = true;
	if (!stop)
		setTimeout(play, 1);
	}

var found = [];

function dochar() {
	var i = parseInt(num.value);

	// test.forEach(function(i, c) {
		// console.log(i, c);
	// });

	var c = chars[i];
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillText(c, 50, 200);

	code.textContent = c.charCodeAt(0).toString(16);

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

	// console.log(i, c, n_out, n_in);
	if (n_in < 500) {
		found.push(c);
		// alert("found!");
		}
}
