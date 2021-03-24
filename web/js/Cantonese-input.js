// **************************************************
// *** Cantonese pinyin input similar to Google's ***
// **************************************************

// Flow-chart for preparing canto-pinyins.txt:
// 1. yale-sort-by-freq.txt
// 2.

// To do
// =====
// * handle approx pinyins
//   或者最简单的方法是： add another map for similar approx pinyins
//   in other words, look up YKY's pinyin and match to standard pinyin
// * allow choosing of chars by mouse
// * perhaps send to Conkey main window

// To do -- using Google Cantonese pinyin
// ======================================
// * Google has peculiar behavior in that it displays chars not exactly matching given pinyins
// * For each pinyin-given-so-far, there would be a list of words
// * We should imitate this behavior
// * Seems that Google has an algorithm that returns approx pinyins based on frequencies
// * Also, we already have the exact pinyins according to Google
// * So the procedure is:
// 		* extract all exact pinyins
//		* define approx function
//		* list chars according to freq AND match degree

// To do -- phrases
// ================
// * build repository of phrases
//   - how / where to store?
// * each phrase is addressed by 1 or more key?  It may be too slow to search from zero
// * but it may be the job of an RNN -- output a few keys
// * OR, cluster phrases, map chars --> semantic clusters
// * OR, build semantically-organized tree structure
// *

// Done:
// =====
// * intercept keys
// * load pinyinMap
// * accept key, display keys so far
// * put list of chars in column
// * allow choosing of chars by number

// ************************** Read pinyins into buffer ************************
var pin = new Object(); // or just {}
var approx = new Object();

console.log("Loading canto-pinyins.txt\n" +
	$.ajax({
	method: "GET",
	url: "/loadDatabase/canto-pinyins",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");
		lines.forEach(function(line) {
			if (line[0] == '/')
				return;
			else if (pin[line.substr(1)] == undefined)
				pin[line.substr(1)] = line.substr(0,1);
			else
				pin[line.substr(1)] += line.substr(0,1);
		});
	}}));

console.log("Loading exact-Google-pinyins-1.txt\n" +
	$.ajax({
	method: "GET",
	url: "/loadDatabase/exact-Google-pinyin2-1",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");
		lines.forEach(function(line) {
			if (line[0] == '/')
				return;
			else if (pin[line.substr(1)] == undefined)
				pin[line.substr(1)] = line.substr(0,1);
			else
				pin[line.substr(1)] += line.substr(0,1);
		});
	}}));

var current_pinyin = "";
var current_num = 0;
var chars = "";

$("#white-box").keydown(function (e) {
	if (e.which == 27) {						// Escape
		current_pinyin = "";
		current_num = 0;
		e.preventDefault();
    }

    if (e.which >= 65 && e.which <= 90) {		// A-Z
		current_num = 0;
		current_pinyin += String.fromCharCode(e.which + 32);

		// display chars
		chars = pin[current_pinyin];
		if (chars != undefined)
			showChars();

		e.preventDefault();
    }

	if (e.which >= 48 && e.which <= 57) {		// 0-9
		// choose chars
		current_num = current_num * 10 + (e.which - 48);
		sendChar(current_num);
		current_pinyin += '●';
		e.preventDefault();
	}

	document.getElementById("pinyin-bar").innerHTML = current_pinyin;
});

function sendChar(i)
{
	if (i <= 9)
		document.getElementById("white-box").value += chars.charAt(i);
	else {
		element = document.getElementById("white-box");
		element.value = element.value.slice(0,-1) + chars.charAt(i);
	}
}

function showChars()
{
	var column1 = document.getElementById("column1");
	column1.innerHTML = "";		// clear the contents first

	for (var i = 0; i < chars.length; ++i)
		{
		var c = chars.charAt(i);
		// column1.appendChild(document.createTextNode(nums[i] + '.'));
		var num = i.toString();
		if (i < 10)
			num += " ";

		textNode = document.createElement('span');
		textNode.appendChild(document.createTextNode(num + c));
		column1.appendChild(textNode);

		// var row = column1.insertRow(-1)
		// var cell = row.insertCell(0);
		// cell.innerHTML = c;
		}
}

var column2 = document.getElementById("column2");
column2.innerHTML = "test";		// clear the contents first

console.log("So far so good, from Cantonese-input.js");
