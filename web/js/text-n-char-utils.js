// ***************** Text and Character utils *****************

// ********** convert traditional Chinese chars to simplified
function simplify(str, forcing=false) {
	var c = c2 = '', str2 = "";

	if (!forcing && $("#simplify").prop("checked") === false)
		return str;

	for (i = 0; i < str.length; ++i) {
		c = str[i];
		// convert character to Simplified
		c2 = h[c];
		if (c2 != undefined)
			str2 += c2;
		else
			str2 += c;
	}
	return str2;
}

// ********** convert simplified Chinese chars to traditional
function traditionalize(str) {
	var c = c2 = '', str2 = "";

	for (i = 0; i < str.length; ++i) {
		c = str[i];

		// convert character to traditional
		var c2 = undefined;
		for (var x in h)
			{
			if (h[x] === c)
				{
				c2 = x;
				break;
				}
			}
		// but there are exceptions:
		if (c2 === undefined)
			str2 += c;
		else if (h_exceptions.includes(c2))
			str2 += c;
		else
			str2 += c2;
	}
	return str2;
}

function simplify_char(c) {
	const c2 = h[c];
	if (c2 != undefined)
		return c2;
	else
		return c;
}

// ************* replace with YKY shorthands
function replaceYKY(str) {
	// replace more than one '。' with equal number of "…"
	var str = str.replace(/(。{2,})/g, (_, g1) => "…".repeat(g1.length));
	// str = str2.replace(/\//g, "|");
	// str2 = str.replace(/娘/g, "孃");
	// str2 = str.replace(/\'/g, "`");
	// str = str2.replace(/\r/g, "\r\n");
	// if (str2.slice(-1) === ',' && str2.charCodeAt(str2.length - 2) > 255)
		// str2 = str2.slice(0,-1) + '，';		// big comma

	// Big comma but only if the previous char is Chinese
	str = str.replace(/(?![^\x00-\x7F])\,/g,"，");		// big comma
	str = str.replace(/(?![^\x00-\x7F])\:[^\)]/g,"：");		// big colon
	// big period only if previous char is Chinese and next char is not '.' also
	str = str.replace(/(?![\x00-\x7F])\.(?![\.])/g,"。");	// **** NOT WORKING!!
	return str;
}

function display_pinyin(str) {
	if (typeof str === 'undefined')
		str = document.getElementById("white-box").value;
	var str2 = "";

	for (var i = 0, len = str.length; i < len; ++i) {
		var c = str[i];
		var simplified = h[c];
		if (simplified === undefined)
			simplified = c;
		var pinyins = pin[simplified];

		str2 += simplified;
		if (pinyins == undefined)
			str2 += " ";
		else
			{
			var consonant = pinyins[0];
			var nucleus = pinyins[1];
			var tone = pinyins[2];
			var n0 = '!';

			if (tone == 1) {
				if (nucleus[0] == 'a') n0 = 'ā';
				if (nucleus[0] == 'e') n0 = 'ē';
				if (nucleus[0] == 'i') n0 = 'ī';
				if (nucleus[0] == 'o') n0 = 'ō';
				if (nucleus[0] == 'u') n0 = 'ū';
			}
			else if (tone == 2) {
				if (nucleus[0] == 'a') n0 = 'á';
				if (nucleus[0] == 'e') n0 = 'é';
				if (nucleus[0] == 'i') n0 = 'í';
				if (nucleus[0] == 'o') n0 = 'ó';
				if (nucleus[0] == 'u') n0 = 'ú';
			}
			else if (tone == 3) {
				if (nucleus[0] == 'a') n0 = 'ă';
				if (nucleus[0] == 'e') n0 = 'ě';
				if (nucleus[0] == 'i') n0 = 'ĭ';
				if (nucleus[0] == 'o') n0 = 'ŏ';
				if (nucleus[0] == 'u') n0 = 'ŭ';
			}
			else if (tone == 4) {
				if (nucleus[0] == 'a') n0 = 'à';
				if (nucleus[0] == 'e') n0 = 'è';
				if (nucleus[0] == 'i') n0 = 'ì';
				if (nucleus[0] == 'o') n0 = 'ò';
				if (nucleus[0] == 'u') n0 = 'ù';
			}
			if (n0 == '!')
				str2 += (consonant + nucleus);  	// tone.toString()
			else
				str2 += (consonant + n0 + nucleus.substr(1));
			str2 += ' ';
		}
	}
	// Copy to Pinyin Box
	document.getElementById("pinyin-box").innerHTML = str2;
}

// **** Read hcutf8.txt into buffer ****
// the file "hcutf8.txt" is from /chinese/zhcode
var h = new Object(); // or just {}
var h_exceptions = new Array();

$.ajax({
method: "GET",
url: "/loadDatabase/hcutf8-YKY.txt",		// Note: name with extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		if (line[0] == '/')				// comments
			return;
		if (line[0] == '-')	{			// YKY prefers no change in usual usage
			return						// just return for now
			}
		if (line[0] == '>') {			// unidirectional change only
			h[line[1]] = line.substr(2);
			h_exceptions.push(line[1]);
			}
		else {
			h[line[0]] = line.substr(1);
			}
	});
	console.log("Loaded hcutf8-YKY.txt into h[].");
}});

// **** Read pinyins into buffer ****
var pin = new Object(); // or just {}

$.ajax({
method: "GET",
url: "/loadDatabase/pinyins.txt",		// Note: name with extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		var pinyin = line.substr(1).split(',');
		pin[line.substr(0,1)] = [pinyin[0], pinyin[1], parseInt(pinyin[2])];
	});
	console.log("Loaded pinyins.txt into pin[].");
}});

