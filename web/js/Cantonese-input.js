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
// * intercept keys
// * load pinyinMap
// * accept key, display keys so far
// * put list of chars in column
// * allow choosing of chars by number

// ************************** Read pinyins into buffer ************************
var pin = new Object(); // or just {}
var approx = new Object();

console.log("Loading canto-pinyins.txt into pin[]:\n" +
$.ajax({
method: "GET",
url: "/loadDatabase/canto-pinyins",		// Note: name without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		if (pin[line.substr(1)] == undefined)
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

throw new Error("Script normally terminated.");

// Indexes for creating new words
var word_index = 0;
var node_index = 0;

// History of input box
var history = new Array();
var history_index = 0;			// current position of history, which should be empty
var history_view_index = 0;		// current viewing position of history

// Fill the 1st column (= leftmost column) with sub-dirs of current dir
function fillDirs()
{
	var table = document.getElementById("sub-dirs");
	table.innerHTML = "";			// clear the contents first

	// Display sub-dirs of current dir
	for (i = currentNode.length - 1; i > 0; --i) {
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = currentNode[i][0][0];
	}

	if (currentNode.length <= 1) {	// use <= 1 for single-column view
		document.getElementById("column1").style.width = "0%";
		document.getElementById("column2").style.width = "100%";
	} else {
		document.getElementById("column1").style.width = "25%";
		document.getElementById("column2").style.width = "74%";
	}

	fillSuggestions();

	// On click: highlight the selection and display next-level menu
	// On double-click: ? (no action yet)
	$('#sub-dirs tr').click(function() {
		// remove old highlight and set new highlight
		$("#level1 tr.selected").removeClass("selected");
		$(this).addClass('selected');

		// display next-level menu
		textNode = document.createElement('span');
		textNode.appendChild(document.createTextNode(this.cells[0].innerText));
		document.getElementById("header-bar").insertAdjacentText("beforeEnd", ">");
		document.getElementById("header-bar").appendChild(textNode);
		currentNode = currentNode[this.rowIndex + 1];
		textNode.target = currentNode;

		$(textNode).on('click', function(ev)
			{
			// remove sub-dirs lower than the one clicked
			header = $("#header-bar")[0].childNodes;
			while (header[header.length - 1] != this) {
				header[header.length - 1].remove();
				}
			currentNode = this.target;
			fillDirs();
			});

		fillDirs();
	});
}

// Global variables for distinguishing between click and double-click
var clicktimer;
var e_click;
var id_click;
var clicked_str;

var imgWord;	// word displayed for image at mouse position

var mouse = {x: 0, y: 0};	// mouse position

// Fill the horizontal panel with suggested words
function fillSuggestions()
{
	var div = document.getElementById("suggestions");
	div.innerHTML = "";			// clear contents first

	node = currentNode;
	// ****** For pictures
	if (node[0][0] == 'ClothingPic') {
		img = document.createElement('img');
		img.setAttribute('src', 'images/lingerie.jpg');
		// 'https://raw.githubusercontent.com/Cybernetic1/conceptual-keyboard/master/web/images/lingerie.jpg');
		// 'height', '1px'
		imgWord = document.createTextNode(node[0][0]);
		div.appendChild(imgWord);
		div.appendChild(document.createElement("br"));
		div.appendChild(img);
		$("img").on('mousemove', function(ev)
			{
			// read mouse position
			element = $(ev.target);
			mouse.x = (ev.clientX || ev.pageX) - ev.target.offsetLeft;
			mouse.y = (ev.clientY || ev.pageY) - ev.target.offsetTop;
			// determine word @ mouse position

			// change word accordingly
			imgWord.textContent = ">" + mouse.x + "," + mouse.y;
			});
		return;
	}

	// node[0] contains its data.
	// For each data item inside this node:
	for (i = 1; i < node[0].length; ++i) {
		s = node[0][i];

		// Each data item could still contain multiple words separated by " ".
		// We add every word to the Suggestions panel as HTML <span> elements:
		s.split("|").forEach(function(s1) {
			textNode = document.createElement('span');
			textNode.appendChild(document.createTextNode(s1));
			div.appendChild(textNode);

			// Here we've created a "span" element
			// may want to attach click events to it?
			//
		});
		// after each line, add a <br> for clarity
		div.appendChild(document.createElement("br"));
	}

	// On click: send to [previously Green] White box
	// On double-click: send to output directly
	// may be depend on where (in which Box) the span element is located
	// the location can be given by [DOMelement].parentNode or .parentElement
	$("#suggestions span").on('click', function(ev)
		{
		clicked_str = this.textContent;
		e_click = ev;
		id_click = this.id;
		var spanItem = this;
		// we need to use timer to distinguish single and double-click
		clicktimer = window.setTimeout(function () {
			if(e_click) {
				word_SingleClick(spanItem);
				clearTimeout(clicktimer);
				clicktimer = null;
				}
			}, 900);
		})
		.dblclick(function(ev)
			{
			window.clearTimeout(clicktimer);
			e_click = null;
			id_click = null;
			word_DoubleClick();
			});

	// On right click: add to front-of-text in White Box
	$("#suggestions span").on('contextmenu', function(ev)
		{
		// Play a sound
		var audio = new Audio("sending.ogg");
		audio.play();
		clicked_str = this.textContent;
		// add to front-of-text:
		old_str = document.getElementById("white-box").value;
		document.getElementById("white-box").value = clicked_str + old_str;
		return false;		// suppress context-menu popping up
		});
}

// Find index of a string inside currentNode[0] (which is the current list of
// suggestions).
// Used in SingleClick()
function find_index(str) {
	// currentNode[0] is an array of strings
	currentNode[0].forEach(function (line, index) {
		if (line.indexOf(str) != -1)		// we just need to find the line it occurs
			return index;
	});
}

// Event handler for single-click of a suggested word
function word_SingleClick(item) {
	var selection = clicked_str;			// the clicked word (string)

	// currentNode[0][j] contains a text list of items separated by '|'
	// Find the location of selected string, has to make sure that:
	// 1. its prefix is either beginning-of-line or '|'
	// 2. its postfix is either EOL or '|'
	var j = -1;
	var index = -1;
	var endIndex = -1;
	var old_s = "";
	for (i = 0; i < currentNode[0].length; ++i) {
		old_s = currentNode[0][i];
		index = old_s.indexOf(selection);
		endIndex = index + selection.length;
		if ((index > -1) &&
				((index == 0) || (old_s[index - 1] == '|')) &&
				((endIndex >= old_s.length) || (old_s[endIndex] == '|'))) {
			j = i;
			break;
			}
		}
	// console.log("**** index is ", j);

	// There can be 3 operations:
	// 1. delete clicked word in suggestions
	// 2. change word in suggestions to WhiteBox word
	// 3. append (WhiteBox) word to suggestions
	// 4. send clicked word to Green box / Output
	if ($("#delete").prop("checked") === true) {
		if (j > -1) {
			// remove from tree data structure
			if ((endIndex < old_s.length) && (old_s[endIndex] == '|'))
				endIndex += 1;
			var replaced_s = old_s.slice(0, index) + old_s.slice(endIndex);
			currentNode[0][j] = replaced_s;

			// remove from HTML page
			$(item).remove();
			}
		$("#delete").prop("checked", false);	// reset button state
	}
	else if ($("#change").prop("checked") === true) {
		// get value of input box (white box)
		new_s = document.getElementById("white-box").value;

		if (j > -1) {
			// change item in tree data structure
			var replaced_s = old_s.replace(selection, new_s);
			currentNode[0][j] = replaced_s;

			// change HTML in page
			item.textContent = new_s;
			}
		$("#change").prop("checked", false);	// reset button state
	}
	else if ($("#append").prop("checked") === true) {
		// get value of input box (white box)
		new_s = "|" + document.getElementById("white-box").value;

		if (j > -1) {
			// change item in tree data structure
			// '|' is added above
			currentNode[0][j] += new_s;

			// change HTML in page
			item.textContent = new_s;
			}
		$("#append").prop("checked", false);	// reset button state
	}
	else {
		// create a new <span> element
		// textNode = document.createElement('span');
		// textNode.id = 'word_' + word_index;
		// ++word_index;

		// allow dragging of the word
		// textNode.draggable = true;
		// textNode.ondragstart = drag;
		// textNode.appendChild(document.createTextNode(selection));

		// insert it into <green-box>
		// document.getElementById("green-box").appendChild(textNode);

		var audio = new Audio("sending.ogg");
		audio.play();

		// Add to end of text:
		document.getElementById("white-box").value += selection;
	}
}

// Event handler for double-click on a suggested word
// Action: send the text directly to output
function word_DoubleClick(str) {
	// Play a sound
	var audio = new Audio("sending.ogg");
	audio.play();
	// Send output via message to Google Chrome extension script:
	// clicked_str = simplify(clicked_str);
	send2Chat(clicked_str);
}

// Load database from server
function loadDB(dbname)
{
	// Read lexicon (plain text file) into memory, store as tree data structure
	// The tree structure is stored as nested arrays.

	// old code:  $.get(pathname, function(data) { ...

	console.log($.ajax({
	method: "GET",
	url: "/loadDatabase/" + dbname,		// Note: name without extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");

		database = new Array();
		var node = database;
		node[0] = new Array();		// initialize data array for root

		lines.forEach(function(line) {
			if (line[0] === '\t') {
				// This is a heading line.
				// After '\t' is the section number,
				// followed by the section title.

				// Get the section sequence, such as "2.1.3" ==> [2, 1, 3]
				var section = line.slice(1, line.indexOf(' ') - 1);
				var sequence = section.split('.').map(function(s) {return parseInt(s);});
				// console.log(sequence);

				// Traverse the tree and add a new node (or nodes)
				node = database;								// starting at the root

				sequence.forEach(function(number) {
					if (node[number] != null)					// If node exists,
						node = node[number];					// traverse down the tree
					else
						{
						node[number] = new Array();				// else create new node
						node = node[number];					// and go down that new node
						// store new node's title as first element of new array
						nodeName = line.slice(line.indexOf(' ') + 1);
						node[0] = [ nodeName ];					// a new array with 1 element
						}
					});
				}
			else {	// this is an non-heading line (ie, data)
				node[0][node[0].length] = line;					// add item to end of array
				}
			});

		// **** Initialize
		currentNode = database;

		// Create "root" button in first column
		textNode = document.createElement('span');
		textNode.innerText = "⬤";
		document.getElementById("header-bar").innerHTML = "";
		document.getElementById("header-bar").appendChild(textNode);
		textNode.style.border = "0px";
		textNode.target = database;
		$(textNode).on('click', function(ev)
			{
			// remove sub-dirs lower than the one clicked
			header = $("#header-bar")[0].childNodes;
			while (header[header.length - 1] != this) {
				header[header.length - 1].remove();
				}
			currentNode = database;
			fillDirs();
			});

		fillDirs();			// update web-page panels according to new database
		}
	}));
}

// Save database
function saveDB(dbname)
{
	// Traverse database and convert contents to string
	function db_2_str(node, section) {
		var s0 = "";
		// console.log("length= " + node.length);

		// for each element node[i]
		var i = 0;		// Don't know why but this is needed to make i a local var!
		for (i = 1; i < node.length; ++i) {
			// console.log("section=" + section + "." + i);
			// debugger;

			// print section number and heading
			s0 += ("\t" + section + i + ". ");			// print section number
			s0 += (node[i][0][0] + "\n");				// print heading

			//	loop to print every data element in node[i][0]
			for (j = 1; j < node[i][0].length; ++j)
				s0 += (node[i][0][j] + "\n");

			// for each element in node[i][j],
			//	ie, repeat * for each node[i], unless it is empty
			if (node[i].length > 1)
				s0 += db_2_str(node[i], section + i + ".");
		}
		return s0.replace(/\s+$/g,'\n');		// remove tailing spaces
	}

	var s = db_2_str(database, "");

	// Add the special beginning section
	// First section is stored in database[0]
	// "root" is stored in database[0][0]
	var s1 = ""
	for (j = 0; j < database[0].length; ++j)
		s1 += (database[0][j] + "\n");
	s = s1 + s;

	// Save the file via a HTTP request to server
	// Server side could save to a specific directory
	console.log($.ajax({
		method: "POST",
		url: "/saveDatabase/" + dbname,
		data: s,
		success: function(resp) {}
	}));

}

// ******************************* Menu buttons ********************************

// **** record in history
function recordHistory(str) {
	history[history_index] = str;
	++history_index;
	if (history_index == 500) history_index = 0;
	history_view_index = -1;
}

// ********** convert Chinese to Cantonese
function cantonize(str) {
	$.get("/askGenifer/cantonize/" , { data: str }, function(data) {
		// document.getElementById("white-box").value = data;
		document.getElementById("pink-box").value = data;
	});
}

function send2Chat(str) {
	// if ($("#firefox").prop("checked") === false) {
	//	window.postMessage({type: "FROM_PAGE", text: str}, "*");
	//	return;
	// }

	$.ajax({
		method: "POST",
		url: "./fireFox",
		data: str,
		success: function(resp) {
			// console.log("Fire: " + str);
		}
	});
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

// Genifer:  save input-output pair in ./training directory
document.getElementById("genifer-teach").addEventListener("click", function() {
	var in_str  = document.getElementById("red-box").value;
	var out_str = document.getElementById("pink-box").value;

	// send to server for saving
	console.log($.ajax({
		method: "POST",
		url: "/saveTrainingPair/",
		data: {input: in_str, output: out_str},
		success: function(resp) {}
	}));

}, false);

// ********** convert traditional Chinese chars to simplified
function simplify(str) {
	var c = c2 = '', str2 = "";

	if ($("#simplify").prop("checked") === false)
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

// ************* replace with YKY shorthands
function replaceYKY(str) {
	str2 = str.replace(/。。/g, "……");
	str = str2.replace(/…。/g, "……");
	str2 = str.replace(/娘/g, "孃");
	return str2;
}

function quicksend() {
	str = document.getElementById("white-box").value;
	// str = simplify(str);
	str = replaceYKY(str);

//	if (to_skype) {			// Try to send text to Skype chat dialog
//		Skype.ui({				// don't know how to do it yet...
//			name: "",
//			element: "",
//			participants: [""]
//		});
//	}

	recordHistory(str);
	display_pinyin(str);

	send2Chat(str);

	// clear input box
	document.getElementById("white-box").value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}

// Key pressed on White-Box
document.getElementById("white-box").onkeypress = function(e) {
	if (!e)
		e = window.event;

	var keyCode = e.keyCode || e.which;

	if (keyCode === 13) {						// enter key = 13
		quicksend();
		return false;
	}
};

var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFFF\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
var spaceRE = /\s+/g;
var oldWhite = '';		// Previous white-box content

// Text changed in White Box:
jQuery('#white-box').on('input', function() {
	// Detect change and record it in white-box content
	// Algorithm:  detect head; cut head; detect tail; cut tail

	var newWhite = document.getElementById("white-box").value;

	// detect head
	var i = 0;
	for ( ; i < oldWhite.length; ++i) {
		if (oldWhite[i] != newWhite[i])
			break;
	}

	// detect tail
	var j = oldWhite.length - 1,
        k = newWhite.length - 1;
	for ( ; j >= 0 && k >= 0; --j, --k) {
		if (oldWhite[j] != newWhite[k])
			break;
	}

	// cut head and tail
	newWhite = newWhite.substring(i, k + 1);

	// remove all punctuations and spaces
	var newWhite2 = newWhite.replace(punctRE, '').replace(spaceRE, '');
	// var lastWhite2 = lastWhite.replace(punctRE, '').replace(spaceRE, '');
	// remove previous content from new content
	// var delta = newWhite2.replace(new RegExp(lastWhite2, 'g'), '');

	// if it is just a single English letter or number
	if (newWhite2.match(/[A-Za-z0-9]/))
		// oldWhite is unchanged, so insertions will accumulate
		// (at least when they occur at the same location)
		return;

	// Record in database, and optionally speak Mandarin
	if (newWhite2.length != 0) {
		/*
		$.ajax({
			method: "POST",
			url: "/logTyping/",
			data: {data: newWhite2},
			success: function(resp) {
				console.log("Typing Log: " + newWhite2);
			}
		});
		*/

		if ($("#speech").prop("checked") === true)
			$.ajax({
				method: "POST",
				url: "/speakMandarin/",
				data: {text: newWhite2},
				success: function(resp) {
					// nothing
				}
			});

		display_pinyin(newWhite2);
	}

	// record for next time
	oldWhite = document.getElementById("white-box").value;
});

// ON WINDOW CLOSE --- Save Typing Log data
// window.onbeforeunload = flushTypings;

function flushTypings() {
	var datetime = new Date();
	var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
			+ "(" +   datetime.getHours() + "-" + datetime.getMinutes() + ")";

	$.ajax({
		method: "POST",
		url: "/flushTyping/",
		data: {data: timeStamp + ".txt"},		// file name
		success: function(resp) {
			console.log("Typing Log flushed");
		}
	});

	var audio = new Audio("sending.ogg");
	audio.play();
	return null;
}

// Browsing history with up and down arrows
document.onkeydown = checkKey;

function checkKey(e) {
	e = e || window.event;

	if (e.keyCode == 38) {							// up arrow key
		// console.log("up arrow detected");
		if (history_view_index == -1)
			history_view_index = history_index - 1;
		else
			--history_view_index;
		document.getElementById("white-box").value = history[history_view_index];
	}
	if (e.keyCode == 40) {							// down arrow key
		// console.log("down arrow detected");
		if (history_view_index != -1)				// -1 = no history to view
			{
			++history_view_index;
			if (history_view_index == history_index)	// reached end of history?
				{
				history_view_index = -1;
				document.getElementById("white-box").value = "";
				}
			else
				document.getElementById("white-box").value = history[history_view_index];
			}
	}
	// document.getElementById("white-box").focus();
};

function allowDrop(ev)
{
	ev.preventDefault();
}

function drag(ev)
{
	ev.dataTransfer.setData("Text", ev.target.id);
	// console.log('targetid: ' + ev.target.id);
}

function drop(ev)
{
	ev.preventDefault();
	var data = ev.dataTransfer.getData("Text");
	// ev.target.appendChild(document.getElementById(data));
	var oldValue = ev.target.value;
	ev.target.value = document.getElementById(data).textContent + oldValue;
	// console.log("dropped onto: " + ev.target.id);
}

// *********************** Initialize by loading database **********************

loadDB("database_default");
// initial chat room is "voov"
// window.postMessage({type: "CHAT_ROOM", text: "hklove"}, "*");

console.log("So far so good, from Cantonese-input.js");
