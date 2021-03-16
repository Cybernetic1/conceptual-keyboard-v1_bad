// ***********************************************
// *** Code for storing the database in a tree ***
// *** and for handling the user interface     ***
// ***********************************************

// To do: (Misc)
// * determine automatic log name (seems to be solved by server?)
// * enable using more self-nickname variants
// * on page close save log
// * log what she says
// * forget Typing Log directory files periodically

// To do: (abandoned)
// * left and right click in Green Box
// * drag-and-drop to white box
// * create an area like a clipboard, that can be saved

// To do: (Cantonese with Genifer 5)
// -- it's Genifer's job now

// To do: (Pictures)
// * determine word @ mouse position
//		- need data structure:  list of { word, rectangle }
// * use mouse to draw rectangle and record params
// * display rectangle when mouse-over / mouse-off
// * save params in a data file
// * how to name and store image files?
// * images may have its own navigation system
//		- how to build via machine learning?

/* Notes on trianglulation geometry
point p1(x1, y1);
point p2(x2, y2);
point p3(x3, y3);

point p(x,y); // <-- You are checking if this point lies in the triangle.

p = (alpha)*p1 + (beta)*p2 + (gamma)*p3

float alpha = ((p2.y - p3.y)*(p.x - p3.x) + (p3.x - p2.x)*(p.y - p3.y)) /
        ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
float beta = ((p3.y - p1.y)*(p.x - p3.x) + (p1.x - p3.x)*(p.y - p3.y)) /
       ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
float gamma = 1.0f - alpha - beta;

If all of alpha, beta, and gamma are greater than 0, then the point p lies within the triangle made of points p1, p2, and p3.
*/

// ************* Tree data structure *************
// The format is an array of arrays of arrays...
// For example, the top-level nodes are: database[1], database[2], database[3], etc...
// All node indexes start at 1.
// Deeper nodes are such as database[3][1][4]... for node 3.1.4... etc
// For each node, data[x][y]...[z][0] holds its data, which is also an array.
// Within the "data" array, element 0 is the name of "that" node.
// In other words, the name of node 4.2.3.7 is database[4][2][3][7][0][0].
var database = new Array();

var currentNode = null;		// node (within database) currently selected by user

// Indexes for creating new words
var word_index = 0;
var node_index = 0;

// History of input box
const MaxHistory = 1000;
var history = new Array(MaxHistory);
var history_index = 0;			// current position of history, which should be empty
var history_view_index = -1;	// current viewing position of history

// Fill the 1st column (= leftmost column) with sub-dirs of current dir
function fillDirs()
{
	var table = document.getElementById("sub-dirs");
	table.innerHTML = "";			// clear the contents first

	// Display sub-dirs of current dir
	for (i = currentNode.length - 1; i > 0; --i) {
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		subdirName = currentNode[i][0][0];
		if (subdirName[0] == '!')					// name = "!pictures.png"
			cell.innerHTML = subdirName.slice(1,-4);
		else
			cell.innerHTML = subdirName;
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
	// For pictures
	if (node[0][0] && node[0][0].startsWith('!')) {
		img = document.createElement('img');
		img.setAttribute('src', 'images/' + node[0][0].substr(1));
		// 'height', '1px'
		// imgWord = document.createTextNode(node[0][0].slice(1,-4));
		imgWord = document.createElement('span');
		imgWord.appendChild(document.createTextNode("..."));
		mousePosition = document.createTextNode(" >0,0");
		div.appendChild(img);
		div.appendChild(document.createElement("br"));
		div.appendChild(imgWord);
		div.appendChild(mousePosition);
		// rect = img.getBoundingClientRect();
		img.addEventListener('mousemove', ev => {
			// read mouse position
			rect = img.getBoundingClientRect();
			mouse.x = ev.clientX - rect.left;
			mouse.y = ev.clientY - rect.top;
			// determine word @ mouse position
			// change word accordingly
			mousePosition.textContent = " >" + mouse.x + "," + mouse.y;
			for (i = 1; i < node[0].length; ++i) {
				s = node[0][i];
				result = s.slice(1).split(",");
				if (mouse.x >= result[0] && mouse.y >= result[1])
					imgWord.textContent = result[2];
				}
			});
		img.addEventListener('click', ev => {
			clicked_str = imgWord.textContent;
			word_SingleClick(imgWord);
			});
		//$("img").on('mousemove', function(ev)
			//{
			//// read mouse position
			//element = $(ev.target);
			//// mouse.x = (ev.clientX || ev.pageX) - ev.target.offsetLeft;
			//// mouse.y = (ev.clientY || ev.pageY) - ev.target.offsetTop;
			//let bound = element.getBoundingClientRect();
			//mouse.x = (ev.clientX) - bound.left;
			//mouse.y = (ev.clientY) - bound.top;
			//// determine word @ mouse position

			//// change word accordingly
			//imgWord.textContent = ">" + mouse.x + "," + mouse.y;
			//});
	}

	// node[0] contains its data.
	// For each data item inside this node:
	for (i = 1; i < node[0].length; ++i) {
		s = node[0][i];

		// If s = picture coordinate
		if (s.startsWith('!'))
			continue;

		// Each data item could still contain multiple words separated by " ".
		// We add every word to the Suggestions panel as HTML <span> elements:
		s.split("┆").forEach(function(s1) {
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
				((index == 0) || (old_s[index - 1] == '┆')) &&
				((endIndex >= old_s.length) || (old_s[endIndex] == '┆'))) {
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
			if ((endIndex < old_s.length) && (old_s[endIndex] == '┆'))
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
		new_s = "┆" + document.getElementById("white-box").value;

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

// **** Save to client side with this code:
//	var textFileAsBlob = new Blob([s0], {type: 'text/plain'});
//	var fileNameToSaveAs = "database-out.txt";	//	must be "Downloads" directory
//	var downloadLink = document.createElement("a");
//	downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
//	downloadLink.download = fileNameToSaveAs;
//	downloadLink.click();
}

// ******************************* Menu buttons ********************************

document.getElementById("send-clipboard").addEventListener("click", function() {
	var whiteBox = document.getElementById("white-box");
	str = whiteBox.value;
	str = simplify(str);
	str = replaceYKY(str);
	whiteBox.value = str;

	whiteBox.focus();
	whiteBox.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	// The window.postMessage commmand seems obsolete:
	//window.postMessage({type: "CLIPBOARD", text: str}, "*");

	recordHistory(str);

	// clear input box
	whiteBox.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

// **** record in history
function recordHistory(str) {
	history[history_index] = str;
	++history_index;
	if (history_index == MaxHistory)
		history_index = 0;
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

document.getElementById("do-log").addEventListener("click", function() {
		// No need to get date & time -- server will do that automatically
		// Get date and time
		// var date = new Date();
		// var logName = date.toDateString().replace(/ /g,"-");
		send2Chat("!log quick");
		var audio = new Audio("sending.ogg");
		audio.play();
}, false);

document.getElementById("do-history").addEventListener("click", function() {
		send2Chat("!his");
		var audio = new Audio("sending.ogg");
		audio.play();
}, false);

document.getElementById("do-URL-escape").addEventListener("click", function() {
		str = document.getElementById("white-box").value;
		str2 = decodeURIComponent(str);
		document.getElementById("white-box").value = str2;
}, false);

document.getElementById("do-traditionalize").addEventListener("click", function() {
		str = document.getElementById("white-box").value;
		str2 = traditionalize(str);
		document.getElementById("white-box").value = str2;
}, false);

document.getElementById("do-Google").addEventListener("click", function() {
		// Open browser and search Google
		str = document.getElementById("white-box").value;
		window.open("https://www.google.com/search?q=" + str);
}, false);

document.getElementById("do-Mandarin").addEventListener("click", function() {
		str = document.getElementById("white-box").value;
		// Copy to Red Box
		document.getElementById("red-box").value = str;
		$.ajax({
			method: "POST",
			url: "./speakMandarin",
			contentType: "application/json; charset=utf-8",
			processData: false,
			data: str,
			success: function(resp) {
				console.log("Mandarin: " + str);
			}
		});
}, false);

document.getElementById("do-Cantonese").addEventListener("click", function() {
		str = document.getElementById("white-box").value;
		// Copy to Pink Box
		document.getElementById("pink-box").value = str;
		// cantonize(str);
		// Pronunciate it
		$.ajax({
			method: "POST",
			url: "/speakCantonese/",
			data: str,
			success: function(resp) {
				// nothing
				}
		});
}, false);

document.getElementById("do-pinyin").addEventListener("click", function() {
		str = document.getElementById("white-box").value;
		display_pinyin(str);
		// Pronunciate it
		$.ajax({
			method: "POST",
			url: "/speakMandarin/",
			data: str,
			success: function(resp) {
				// nothing
				}
		});
}, false);

document.getElementById("do-resize").addEventListener("click", function() {
	$.ajax({
		method: "POST",
		url: "./shellCommand",
		contentType: "application/json; charset=utf-8",
		processData: false,
		data: "wmctrl -r 'Conceptual Keyboard' -e 0,-1,-1,520,450",
		success: function(resp) {
			console.log("Shell command, wmctrl");
		}
	});
}, false);

document.getElementById("quick-simplify").addEventListener("click", function() {
	var whiteBox = document.getElementById("white-box");
	str = whiteBox.value;
	str = simplify(str, forcing=true);	// true means force simplify
	str = replaceYKY(str);
	whiteBox.value = str;

	whiteBox.focus();
	whiteBox.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	// The window.postMessage commmand seems obsolete:
	//window.postMessage({type: "CLIPBOARD", text: str}, "*");

	recordHistory(str);

	// clear input box
	whiteBox.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("quick-complex").addEventListener("click", function() {
	var whiteBox = document.getElementById("white-box");
	str = whiteBox.value;
	str = traditionalize(str);
	str = replaceYKY(str);
	whiteBox.value = str;

	whiteBox.focus();
	whiteBox.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	// The window.postMessage commmand seems obsolete:
	//window.postMessage({type: "CLIPBOARD", text: str}, "*");

	recordHistory(str);

	// clear input box
	whiteBox.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var butt1 = document.getElementById("paste1");
butt1.title = "妳好 :)";
butt1.addEventListener("click", function() {
	send2Chat(butt1.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var butt2 = document.getElementById("paste2");
butt2.title = "喜歡玩文字網愛嗎?";
butt2.addEventListener("click", function() {
	send2Chat(butt2.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var butt3 = document.getElementById("paste3");
butt3.title = "喜歡做什麼？";
butt3.addEventListener("click", function() {
	send2Chat(butt3.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

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
	str = str2.replace(/\//g, "|");
	// str2 = str.replace(/娘/g, "孃");
	str2 = str.replace(/\'/g, "`");
	// str = str2.replace(/\r/g, "\r\n");
	return str2;
}

// ************* This is used when 'enter' is pressed or the '↵' button is clicked:
function quicksend() {
	str = document.getElementById("white-box").value;

	// **** If input ends with 'gg' ---> go to Google search
	if (str.endsWith('gg')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2));
		return;
	}

	// **** If input ends with 'cc' ---> Google search with 中文
	if (str.endsWith('cc')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2) + "%20中文");
		return;
	}

	// **** If input ends with 'yy' ---> Google search with 粤语
	if (str.endsWith('yy')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2) + "%20粤语");
		return;
	}

	str = simplify(str);			// when sending to chat rooms, no simplify
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

	/***** Send to Pidgin #0?
	if ($("#to-pidgin0").prop("checked") === true) {
		var userName = document.getElementsByName("pidgin-who0")[0].value;
		sendPidgin(userName, str);
		return;
	}

	// Send to Pidgin #1?
	if ($("#to-pidgin1").prop("checked") === true) {
		var userName = document.getElementsByName("pidgin-who1")[0].value;
		sendPidgin(userName, str);
		return;
	}
	*****/

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
				data: newWhite2,
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

document.getElementById("flush-typings").addEventListener("click", flushTypings, false);

document.getElementById("send-white").addEventListener("click", quicksend, false);

/*******
function sendPidgin(userName, str) {
	$.ajax({
		method: "POST",
		url: "/sendPidginMessage/" + userName,
		data: {data: str},
		success: function(resp) {
			console.log("Pidgin<" + userName + "> " + str);
		}
	});
}

// Get list of Pidgin window names
document.getElementById("pidgin-names").addEventListener("click", function() {
	var str = "";

	$.ajax({
		method: "GET",
		url: "/getPidginNames/",
		data: str,
		cache: false,
		success: function(data) {
			console.log("Got names:\n" + data);

			pidginNames0 = document.getElementsByName("pidgin-who0")[0];
			pidginNames1 = document.getElementsByName("pidgin-who1")[0];
			pidginNames0.innerHTML = "";
			pidginNames1.innerHTML = "";

			var lines = data.split('\n');
			for (var i = 0; i < lines.length - 1; i += 2) {
				pidginNames0.innerHTML += "<option value=\"" + lines[i] + "\">"
					+ lines[i+1] + "</option>";
				pidginNames1.innerHTML += "<option value=\"" + lines[i] + "\">"
					+ lines[i+1] + "</option>";
				}
		}
	});

}, false);


// Send message to Pidgin #0
document.getElementById("send-pidgin0").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str = simplify(str);
	str = replaceYKY(str);
	recordHistory(str);

	var userName = document.getElementsByName("pidgin-who0")[0].value;
	sendPidgin(userName, str);

	// clear input box
	document.getElementById("white-box").value = "";
}, false);

// Send message to Pidgin #1
document.getElementById("send-pidgin1").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str = simplify(str);
	str = replaceYKY(str);
	recordHistory(str);

	var userName = document.getElementsByName("pidgin-who1")[0].value;
	sendPidgin(userName, str);

	// clear input box
	document.getElementById("white-box").value = "";
}, false);
*****/

// Browsing history with up and down arrows
document.onkeydown = checkKey;

function checkKey(e) {
	e = e || window.event;

	if (e.keyCode == 38) {							// up arrow key
		// console.log("up arrow detected");
		if (history_view_index <= 0) {				// -1 = no history to view
			var stuffs = document.getElementById("white-box").value;
			if (stuffs)
				recordHistory(stuffs);
			history_view_index = history_index - 1;
			}
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

/*
document.getElementById("send-green").addEventListener("click", function() {
	str = document.getElementById("green-box").textContent;
	str = simplify(str);
	str = replaceYKY(str);
	// str = str.replace(/[()]/g, "");  // remove ()'s

	send2Chat(str);
	// console.log("I'm sending something");
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("send-up").addEventListener("click", function() {
	green_str = document.getElementById("green-box").textContent;
	// str = str.replace(/[()]/g, "");		// remove ()'s

	white_str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = white_str + green_str;

	history_view_index = -1;		// No longer in history mode
}, false);

document.getElementById("send-down").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	words = str.split(" ");
	words.forEach(function(word, i, array) {
		// wrap () around all words
		// word = "(" + word + ")";
		// make words draggable
		// create node for all words
		textNode = document.createElement('span');
		textNode.id = 'word_' + word_index;
		++word_index;
		// allow dragging of words
		textNode.draggable = true;
		textNode.ondragstart = drag;
		textNode.appendChild(document.createTextNode(word));
		document.getElementById("green-box").appendChild(textNode);
	});
}, false);
*/

/*
document.getElementById("history-up").addEventListener("click", function() {
	if (history_view_index == -1)
		history_view_index = history_index - 1;
	else
		--history_view_index;
	document.getElementById("white-box").value = history[history_view_index];
}, false);

document.getElementById("history-down").addEventListener("click", function() {
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
}, false);
*/

document.getElementById("clear-white").addEventListener("click", function() {
	document.getElementById("pinyin-box").innerHTML = "";
	var box = document.getElementById("white-box");
	box.value = "";
	box.focus();
	history_view_index = -1;		// No longer in history mode
}, false);

/*
document.getElementById("clear-green1-L").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	node.removeChild(node.firstChild);
}, false);

document.getElementById("clear-green1-R").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	node.removeChild(node.lastChild);
}, false);

document.getElementById("clear-green").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}, false);

document.getElementById("clear-red").addEventListener("click", function() {
	var node = document.getElementById("red-box");
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}, false);
*/

document.getElementById("smile").addEventListener("click", function() {
	document.getElementById("white-box").value += " :)";
}, false);

$("#smile").on("contextmenu", function(ev) {
//	document.getElementById("white-box").value += " :)";
	send2Chat(" :)");
	// console.log("I'm sending something");
	var audio = new Audio("sending.ogg");
	audio.play();
});

document.getElementById("quotes").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "「" + str + "」";
}, false);

document.getElementById("parentheses").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "（" + str + "）";
}, false);

// *********** Functions for manipulating tree categories ***********

// insert White-Box item below currently selected menu node
document.getElementById("insert").addEventListener("click", function() {
	str = document.getElementById("white-box").value;

	// add to tree:
	currentNode[0][currentNode[0].length] = str;

	// just add to #suggestions and refresh
	fillSuggestions();
}, false);

// add a child node to tree
document.getElementById("add-child").addEventListener("click", function() {
	str = document.getElementById("white-box").value;

	// Insert node at tree before currentNode
	// We need to traverse the tree to the currentNode,
	// The problem is to determine where are we.

	currentNode.splice(currentNode.length, 0, [[str]]);

	// whose location is given by level1, level2, level3
	//var parentNode = null;
	//if (level3 != null) {
		//parentNode = database[level1][level2];		// find parent
		//parentNode.splice(level3, 0, [[str]]);		// add new array
	//}
	//else if (level2 != null) {
		//parentNode = database[level1];				// find parent
		//parentNode.splice(level2, 0, [[str]]);		// add new array
	//}
	//else {
		//parentNode = database;						// find parent
		//parentNode.splice(level1, 0, [[str]]);		// add new array
	//}

	// redraw tree menu
	fillDirs();

}, false);


// **************** Choosing which web page to feed output to *****************

/*
document.getElementById("voov").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "voov"}, "*");
}, false);

document.getElementById("adult").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "adult"}, "*");
}, false);
*/

/*
document.getElementById("hklove").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "hklove"}, "*");
}, false);

document.getElementById("ip131").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "ip131"}, "*");
}, false);

document.getElementById("ip203").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "ip203"}, "*");
}, false);
*/

// document.getElementById("skype").addEventListener("click", function() {
//	to_skype = true;
// }, false);

document.getElementById("loadDB").addEventListener("click", function() {
	var dbname = prompt("Enter DB name (without extension .txt)","database_default");
	// In Vivaldi app mode, 'prompt' function does not work and always returns null
	if (dbname == null)
		dbname = document.getElementById("pink-box").value;
	loadDB(dbname);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("saveDB").addEventListener("click", function() {
	var dbname = prompt("Enter DB name (without extension .txt)","database_default");
	// In Vivaldi app mode, 'prompt' function does not work and always returns null
	if (dbname == null)
		dbname = document.getElementById("red-box").value;
	saveDB(dbname);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

window.addEventListener('DOMContentLoaded', splitWords, false);

// **************** Old functions, create draggable elements ******************
// (may become obsolete in next version)

function splitWords() {

	var elems = document.querySelectorAll('.draggable'),
			  text,
			  textNode,
			  words,
			  elem;

	// iterate through all .draggable elements
	for (var i = 0, l = elems.length; i < l; i++) {

		elem = elems[i];
		textNode = elem.childNodes[0];
		text = textNode.nodeValue;

		// remove current text node
		elem.removeChild(textNode);
		words = text.split(' ');

		// iterate through words
		for (var k = 0, ll = words.length; k < ll; k++) {
			// create node for all words
			textNode = document.createElement('span');
			textNode.id = 'word_A' + i + k;
			// allow dragging for words
			textNode.draggable = true;
			textNode.ondragstart = drag;
			textNode.appendChild(document.createTextNode(words[k] + ' '));
			elem.appendChild(textNode);
		}
	}
}

function allowDrop(ev)
{
	ev.preventDefault();
}

function drag(ev)
{
	ev.dataTransfer.setData("Text", ev.target.id);
	// console.log('targetid: ' + ev.target.id);
}

// This function is no longer working
function drop(ev)
{
	ev.preventDefault();
	var data = ev.dataTransfer.getData("Text");
	// ev.target.appendChild(document.getElementById(data));
	var oldValue = ev.target.value;
	// ev.target.value = document.getElementById(data).textContent + oldValue;
	// console.log("dropped onto: " + ev.target.id);
}

// ==================== For dealing with Drop-down menu ========================

/* When the user clicks on the button, toggle between hiding and showing the dropdown content */
function onDropDown() {
    document.getElementById("dropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// *********************** Initialize by loading database **********************

loadDB("database_default");
// initial chat room is "voov"
// window.postMessage({type: "CHAT_ROOM", text: "hklove"}, "*");

// ************************** Read hcutf8.txt into buffer ************************
// the file "hcutf8.txt" is from /chinese/zhcode
var h = new Object(); // or just {}

console.log("Loading hcutf8-YKY.txt into h[]:\n" +
$.ajax({
method: "GET",
url: "/loadDatabase/hcutf8-YKY",		// Note: name without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		if (line[0] != '/')				// comments
			h[line.substr(0,1)] = line.substr(1);
	});
}}));

// ************************** Read pinyins into buffer ************************
var pin = new Object(); // or just {}

console.log("Loading pinyins.txt into pin[]:\n" +
$.ajax({
method: "GET",
url: "/loadDatabase/pinyins",		// Note: name without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		var pinyin = line.substr(1).split(',');
		pin[line.substr(0,1)] = [pinyin[0], pinyin[1], parseInt(pinyin[2])];
	});
}}));

console.log("So far so good, from YKY-input-method.js");
