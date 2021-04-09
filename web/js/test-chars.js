// **** Read YKY custom pinyins file ****

var canvas = document.getElementById('test');
var ctx = canvas.getContext('2d');

ctx.font = '200px serif';
const outer = [77, 74, 101, 126];
const inner = [81, 78, 93, 118];

ctx.fillStyle = 'rgba(255, 255, 255, 1)';
ctx.font = '200px serif';
ctx.fillText('𫔆上A', 50, 200);

// Use these rectangles to locate the character region:

ctx.fillStyle = 'rgba(200, 0, 0, .5)';
ctx.fillRect.apply(ctx, outer);				// outer box

ctx.fillStyle = 'rgba(0, 0, 200, .5)';
ctx.fillRect.apply(ctx, inner);				// inner box

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

ctx.fillStyle = 'rgba(255, 255, 255, 1)';

chars = [];

$.ajax({
method: "GET",
url: "/loadDatabase/YKY-custom-pinyins",		// Note: use filename without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		if (line[0] == '/')
			return;
		chars.push(line[0]);
		});
	console.log("Loaded YKY-custom-pinyins.txt\n");

	var test = chars.slice(200, 300);

	test.forEach(function(i, c) {
		console.log(i, c);
	});

	test.forEach(function(c, i) {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillText(c, 50, 200);

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

		console.log(i, c, n_out, n_in);
		if (n_in == 0 && n_out > 100)
			alert("found!");
		});

}});

