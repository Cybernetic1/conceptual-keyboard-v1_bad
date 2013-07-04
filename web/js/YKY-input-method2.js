// Code for storing the database in a tree, and for handling the user interface

// // This holds the tree data structure.
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
var level4 = 1;
var currentNode = null;

// Indexes for creating new words
var word_index = 0;
var node_index = 0;

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
		level4 = null;
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
		level4 = null;
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
		level4 = null;
		fillColumn4();
		fillSuggestions();
	});
}

// Similar to fillColumn1
function fillColumn4()
{
	var table = document.getElementById("level4");
	table.innerHTML = "";
	for (i = database[level1][level2][level3].length - 1; i > 0; --i) {
		node = database[level1][level2][level3][i];
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = node[0][0];
	}

	// On click: highlight selection and display suggestions
	$('#level4 tr').click(function() {
		$("#level4 tr.selected").removeClass("selected");
		$(this).addClass('selected');

		level4 = this.rowIndex + 1;
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
	if (level4 != null)
		node = database[level1][level2][level3][level4];
	else if (level3 != null)
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

		// We add every word to the Suggestions panel as HTML <span> elements:
		textNode = document.createElement('span');
		textNode.appendChild(document.createTextNode(s));
		div.appendChild(textNode);
	}

	// On click: send to Green box
	// On double-click: send to output directly
	$("#suggestions span").on('click', function(ev)
		{
		clicked_str = this.textContent;
		e_click = ev;
		id_click = this.id;
		clicktimer = window.setTimeout(function () {
			if(e_click) {
				word_SingleClick();
				clearTimeout(clicktimer);
				clicktimer = null;
			}}, 500);
		}).dblclick(function(ev)
		{
		window.clearTimeout(clicktimer);
		e_click = null;
		id_click = null;
		word_DoubleClick();
		});
}

// Event handler for single-click of a suggested word
function word_SingleClick(item) {
	var selection = clicked_str;			// the clicked word (string)

	// There can be 3 operations:
	// 1. delete word
	// 2. change word
	// 3. send word to Green box
	if ($("#delete").prop("checked") === true) {
		// remove from tree data structure
		pos = currentNode[0].indexOf(selection);
		currentNode[0].splice(pos, 1);

		// remove from HTML page
		$("#suggestions span")[pos - 1].remove();

		$("#delete").prop("checked", false);	// reset button state
	}
	else if ($("#change").prop("checked") === true) {
		// get value of input box (white box)
		new_s = document.getElementById("white-box").value;

		// change item in tree data structure
		pos = currentNode[0].indexOf(selection);
		currentNode[0][pos] = new_s;

		// change HTML in page
		$("#suggestions span")[pos - 1].innerText = new_s;

		$("#change").prop("checked", false);	// reset button state
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
	var audio_dicq = new Audio("dicq.ogg");
	audio_dicq.play();
	// Send output via message to Google Chrome extension script:
	window.postMessage({type: "FROM_PAGE", text: clicked_str}, "*");
}

// Load database from server
function loadDB(pathname)
{
	// Read lexicon (plain text file) into memory, store as tree data structure
	// The tree structure is stored as nested arrays.
	$.get(pathname, function(data) {

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
		fillColumn2();
		fillColumn3();
		fillColumn3();
	});
}

// Save database
function saveDB()
{
	// Plain text buffer containing all headings and suggested words
	var s0 = "";

	// Traverse the tree:
	// Note: this part is badly written, as the for-loops are explicit.
	// Tree traversal should be automatic as in the loadDB() code.
	for (i = 1; i < database.length; ++i) {				// Level 1:
		s0 += ("\t" + i + ". ");								// print section number
		s0 += (database[i][0][0] + "\n");					// print heading

		for (h = 1; h < database[i][0].length; ++h)		// print contents
			s0 += (database[i][0][h] + "\n");

		for (j = 1; j < database[i].length; ++j) {		// Level 2:
			s0 += ("\t" + i + "." + j + ". ");				// print section number
			s0 += (database[i][j][0][0] + "\n");			// print heading

			for (h = 1; h < database[i][j][0].length; ++h) 	// print contents
				s0 += (database[i][j][0][h] + "\n");

			for (k = 1; i < database[i][j].length; ++k) {	// Level 3:
				s0 += ("\t" + i + "." + j + "." + k + ". "); // print section number
				s0 += (database[i][j][k][0][0] + "\n");	 	// print heading

				for (h = 1; h < database[i][j][k][0].length; ++h) // print contents
					s0 += (database[i][j][k][0][h] + "\n");

				for (l = 1; i < database[i][j][k].length; ++l) {	// Level 4:
					s0 += ("\t" + i + "." + j + "." + k + "." + l + ". "); // print section number
					s0 += (database[i][j][k][l][0][0] + "\n");	 	// print heading

					for (h = 1; h < database[i][j][k][l][0].length; ++h) // print contents
						s0 += (database[i][j][k][l][0][h] + "\n");
				}
			}
		}
	}

	// Save the file via a HTTP request to server
	$.ajax({
		method: "POST",
		url: "/saveDatabase",
		data: {data: s0},
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

function quicksend() {
	str = document.getElementById("white-box").value;
	window.postMessage({type: "FROM_PAGE", text: str}, "*");
}

document.getElementById("send-white").addEventListener("click", quicksend, false);

document.getElementById("send-green").addEventListener("click", function() {
	str = document.getElementById("green-box").textContent;
	str = str.replace(/[()]/g, "");

	window.postMessage({type: "FROM_PAGE", text: str}, "*");
	// console.log("I'm sending something");
}, false);

document.getElementById("send-up").addEventListener("click", function() {
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

document.getElementById("send-down").addEventListener("click", function() {
	green_str = document.getElementById("green-box").textContent;
	// str = str.replace(/[()]/g, "");		// remove ()'s

	white_str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = white_str + green_str;
}, false);

document.getElementById("clear-white").addEventListener("click", function() {
	document.getElementById("white-box").value = "";
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
	document.getElementById("white-box").value = "``" + str + "''";
}, false);

// *********** Functions for manipulating tree categories ***********

// insert White-Box item to currently selected menu node
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
	fillColumn2();
	fillColumn3();

}, false);


// **************** Choosing which web page to feed output to *****************

document.getElementById("voov").addEventListener("click", function() {
	window.postMessage({type: "CHAT_ROOM", text: "voov"}, "*");
}, false);

document.getElementById("adult").addEventListener("click", function() {
	window.postMessage({type: "CHAT_ROOM", text: "adult"}, "*");
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

// loadDB("synonym_forest_YKY_database.txt");
loadDB("rogets_YKY_database.txt");
console.log("so far so good");
