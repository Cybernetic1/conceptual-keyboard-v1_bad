// Code for storing the database in a tree, and for handling the user interface

// To do:
// * left and right click in Green Box
// * drag-and-drop to white box
// * create an area like a clipboard, that can be saved

// ******* This holds the tree data structure.
// The format is an array of arrays of arrays...
// For example, the top-level nodes are: database[1], database[2], database[3], etc...
// All node indexes start at 1.
// Deeper nodes are such as database[3][1][4]... for node 3.1.4... etc
// For each node, data[x][y]...[z][0] holds its data, which is also an array.
// Within the "data" array, element 0 is the name of "that" node.
// In other words, the name of node 4.2.3.7 is database[4][2][3][7][0][0].
var database = new Array();

// Variables holding which row is currently selected by the user on each level:
var level1 = 1;
var level2 = 1;
var level3 = 1;
var currentNode = null;

// Indexes for creating new words
var word_index = 0;
var node_index = 0;

// History of input box
var history = new Array();
var history_index = 0;				// current position of history, which should be empty
var history_view_index = 0;		// current viewing position of history

// Fill the 1st column (= leftmost column) with nodes from the tree
function fillColumn1()
{
	var table = document.getElementById("level1");
	table.innerHTML = "";			// clear the contents first
	// For each node at the tree on level 1:
	for (i = database.length - 1; i > 0; --i) {
		node = database[i];
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = node[0][0];
	}

	// On click: highlight the selection and display next-level menu
	// On double-click: ? (no action yet)
	$('#level1 tr').click(function() {
		// remove old highlight and set new highlight
		$("#level1 tr.selected").removeClass("selected");
		$(this).addClass('selected');

		// display next-level menu
		level1 = this.rowIndex + 1;
		level2 = null;
		level3 = null;
		fillColumn2();
		fillSuggestions();
	});
}

// Similar to fillColumn1
function fillColumn2()
{
	var table = document.getElementById("level2");
	table.innerHTML = "";
	for (i = database[level1].length - 1; i > 0; --i) {
		node = database[level1][i];
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = node[0][0];
	}

	// On click: highlight selection and display next-level menu
	$('#level2 tr').click(function() {
		$("#level2 tr.selected").removeClass("selected");
		$(this).addClass('selected');

		level2 = this.rowIndex + 1;
		level3 = null;
		fillColumn3();
		fillSuggestions();
	});
}

// Similar to fillColumn1
function fillColumn3()
{
	var table = document.getElementById("level3");
	table.innerHTML = "";
	for (i = database[level1][level2].length - 1; i > 0; --i) {
		node = database[level1][level2][i];
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = node[0][0];
	}

	// On click: highlight selection and display suggestions
	$('#level3 tr').click(function() {
		$("#level3 tr.selected").removeClass("selected");
		$(this).addClass('selected');

		level3 = this.rowIndex + 1;
		fillSuggestions();
	});
}

// Global variables for distinguishing between click and double-click
var clicktimer;
var e_click;
var id_click;
var clicked_str;

// Fill the horizontal panel with suggested words
function fillSuggestions()
{
	var div = document.getElementById("suggestions");
	div.innerHTML = "";			// clear contents first

	// Traverse the tree:
	if (level3 != null)
		node = database[level1][level2][level3];
	else if (level2 != null)
		node = database[level1][level2];
	else
		node = database[level1];

	currentNode = node;				// remember this node in global variable for later use

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

	// On click: send to Green box
	// On double-click: send to output directly
	// may be depend on where (in which Box) the span element is located
	// the location can be given by [DOMelement].parentNode or .parentElement
	$("#suggestions span").on('click', function(ev)
		{
		clicked_str = this.textContent;
		e_click = ev;
		id_click = this.id;
		// we need to use timer to distinguish single and double-click
		clicktimer = window.setTimeout(function () {
			if(e_click) {
				word_SingleClick();
				clearTimeout(clicktimer);
				clicktimer = null;
			}}, 900);

		}).dblclick(function(ev)
			{
			window.clearTimeout(clicktimer);
			e_click = null;
			id_click = null;
			word_DoubleClick();
			});

	// On right click: send to White Box
	$("#suggestions span").on('contextmenu', function(ev)
		{
		clicked_str = this.textContent;
		document.getElementById("white-box").value += clicked_str;
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

	// There can be 3 operations:
	// 1. delete clicked word in suggestions
	// 2. change word in suggestions to WhiteBox word
	// 3. append (WhiteBox) word to suggestions
	// 4. send clicked word to Green box / Output
	if ($("#delete").prop("checked") === true) {
		// remove from tree data structure
		var j = 0;
		for (i = 0; i < currentNode[0].length; ++i) {
			if (currentNode[0][i].indexOf(selection) > -1) {
				j = i;
				break;
			}
		}
		currentNode[0].splice(j, 1);

		// remove from HTML page
		$("#suggestions span:contains('" + selection + "')").remove();

		$("#delete").prop("checked", false);	// reset button state
	}
	else if ($("#change").prop("checked") === true) {
		// get value of input box (white box)
		new_s = document.getElementById("white-box").value;

		// change item in tree data structure
		// currentNode[0] contains the list of suggestions
		// find the line in which selection occurs
		var j = 0;
		for (i = 0; i < currentNode[0].length; ++i) {
			if (currentNode[0][i].indexOf(selection) > -1) {
				j = i;
				break;
			}
		}
		currentNode[0][j] = currentNode[0][j].replace(selection, new_s);

		// change HTML in page
		$("#suggestions span:contains('" + selection + "')").text(new_s);

		$("#change").prop("checked", false);	// reset button state
	}
	else if ($("#append").prop("checked") === true) {
		// get value of input box (white box)
		new_s = "|" + document.getElementById("white-box").value;

		// change item in tree data structure
		// currentNode[0] contains the list of suggestions
		// find the line in which selection occurs
		var j = 0;
		for (i = 0; i < currentNode[0].length; ++i) {
			if (currentNode[0][i].indexOf(selection) > -1) {
				j = i;
				break;
			}
		}
		// currentNode[0][j] += "|";
		currentNode[0][j] += new_s;

		// change HTML in page
		$("#suggestions span:contains('" + selection + "')").text(new_s);

		$("#append").prop("checked", false);	// reset button state
	}
	else {
		// create a new <span> element
		textNode = document.createElement('span');
		textNode.id = 'word_' + word_index;
		++word_index;

		// allow dragging of the word
		textNode.draggable = true;
		textNode.ondragstart = drag;
		textNode.appendChild(document.createTextNode(selection));

		// insert it into <green-box>
		document.getElementById("green-box").appendChild(textNode);
	}
}

// Event handler for double-click on a suggested word
// Action: send the text directly to output
function word_DoubleClick(str) {
	// Play a sound
	var audio = new Audio("sending.ogg");
	audio.play();
	// Send output via message to Google Chrome extension script:
	window.postMessage({type: "FROM_PAGE", text: clicked_str}, "*");
}

// Load database from server
function loadDB(pathname)
{
	// Read lexicon (plain text file) into memory, store as tree data structure
	// The tree structure is stored as nested arrays.
	// The current time is appended to pathname to avoid getting the cached data
	$.get(pathname + "?" + Date.now().toString(), function(data) {

		var lines = data.split("\n");

		database = new Array();
		var node = null;

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
				node = database;									// starting at the root

				sequence.forEach(function(number) {
					if (node[number] != null)					// If node exists,
						node = node[number];						// traverse down the tree
					else
						{
						node[number] = new Array();			// else create new node
						node = node[number];						// and go down that new node
						// store new node's title as first element of new array
						nodeName = line.slice(line.indexOf(' ') + 1);
						node[0] = [ nodeName ];					// a new array with 1 element
						}
				});
			}
			else {	// this is an non-heading line (ie, data)
				node[0][node[0].length] = line;				// add item to end of array
			}
		});

		fillColumn1();			// update web-page panels according to new database
	});
}

// Save database
function saveDB()
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
			s0 += (node[i][0][0] + "\n");					// print heading

			//	loop to print every data element in node[i][0]
			for (h = 1; h < node[i][0].length; ++h)
				s0 += (node[i][0][h] + "\n");

			// for each element in node[i][j],
			//	ie, repeat * for each node[i], unless it is empty
			if (node[i].length > 1)
				s0 += db_2_str(node[i], section + i + ".");
		}
		return s0;
	}

	var s = db_2_str(database, "");

	// Save the file via a HTTP request to server
	// Server side could save to a specific directory
	$.ajax({
		method: "POST",
		url: "/saveDatabase",
		data: {data: s},
		success: function(resp) {
			console.log("file saved");
		}
	});

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
	str = document.getElementById("white-box").value;

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	window.postMessage({type: "CLIPBOARD", text: str}, "*");

	// var sandbox = $("#white-box").val(str).select();
   // document.execCommand('copy');
   // sandbox.val('');

	// record in history
	history[history_index] = str;
	++history_index;
	if (history_index == 100) history_index = 0;
	history_view_index = -1;

	// clear input box
	document.getElementById("white-box").value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var to_skype = false;		// whether to send texts to Skype

function quicksend() {
	str = document.getElementById("white-box").value;

//	if (to_skype) {			// Try to send text to Skype chat dialog
//		Skype.ui({				// don't know how to do it yet...
//			name: "",
//			element: "",
//			participants: [""]
//		});
//	}

	window.postMessage({type: "FROM_PAGE", text: str}, "*");

	// record in history, but don't clear input box
	history[history_index] = str;
	++history_index;
	if (history_index == 100) history_index = 0;
	history_view_index = -1;

	var audio = new Audio("sending.ogg");
	audio.play();
}

// Enter pressed on White-Box
document.getElementById("white-box").onkeypress = function(e) {
	if (!e)
		e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode === 13) {						// enter key = 13
		quicksend();
		return false;
	}
};

document.getElementById("send-white").addEventListener("click", quicksend, false);

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
	document.getElementById("white-box").focus();
};

document.getElementById("send-green").addEventListener("click", function() {
	str = document.getElementById("green-box").textContent;
	// str = str.replace(/[()]/g, "");  // remove ()'s

	window.postMessage({type: "FROM_PAGE", text: str}, "*");
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

document.getElementById("clear-white").addEventListener("click", function() {
	var box = document.getElementById("white-box");
	box.value = "";
	box.focus();
	history_view_index = -1;		// No longer in history mode
}, false);

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

document.getElementById("smile").addEventListener("click", function() {
	document.getElementById("white-box").value += ":)";
}, false);

document.getElementById("quotes").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "「" + str + "」";
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
	// whose location is given by level1, level2, level3
	var parentNode = null;
	if (level3 != null) {
		parentNode = database[level1][level2];		// find parent
		parentNode.splice(level3, 0, [[str]]);		// add new array
	}
	else if (level2 != null) {
		parentNode = database[level1];				// find parent
		parentNode.splice(level2, 0, [[str]]);		// add new array
	}
	else {
		parentNode = database;							// find parent
		parentNode.splice(level1, 0, [[str]]);		// add new array
	}

	// redraw tree menu
	fillColumn1();

}, false);


// **************** Choosing which web page to feed output to *****************

document.getElementById("voov").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "voov"}, "*");
}, false);

document.getElementById("adult").addEventListener("click", function() {
	to_skype = false;
	window.postMessage({type: "CHAT_ROOM", text: "adult"}, "*");
}, false);

// document.getElementById("skype").addEventListener("click", function() {
//	to_skype = true;
// }, false);

document.getElementById("loadDB").addEventListener("click", function() {
	loadDB("database_default.txt");
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("saveDB").addEventListener("click", function() {
	saveDB();
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

function drop(ev)
{
	ev.preventDefault();
	var data = ev.dataTransfer.getData("Text");
	ev.target.appendChild(document.getElementById(data));
	// console.log("dropped onto: " + ev.target.id);
}

// *********************** Initialize by loading database **********************

loadDB("database_default.txt");
// initial chat room is "voov"
window.postMessage({type: "CHAT_ROOM", text: "voov"}, "*");
console.log("so far so good");
