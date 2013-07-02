/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

// The file format should be 1-piece.  But it could be plain or hierarchical.
// Seems that hierarchical would be easier to handle.

var database = new Array();

// Variables holding which row is selected on each level:
var level1 = 1;
var level2 = 1;
var level3 = 1;
var currentNode = null;

// Used for creating new words
var word_index = 0;
var node_index = 0;

function fillColumn1()
{
	var table = document.getElementById("level1");
	table.innerHTML = "";
	for (i = database.length - 1; i > 0; --i) {
		node = database[i];
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = node[0][0];
	}

	// On click: highlight selection and display next-level menu
	// On double-click: ?
	$('#level1 tr').click(function() {
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
		// display next-level menu
		level2 = this.rowIndex + 1;
		level3 = null;
		fillColumn3();
		fillSuggestions();
	});
}

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
		// display next-level menu
		level3 = this.rowIndex + 1;
		fillSuggestions();
	});
}

// global variables for use in this function
var clicktimer;
var e_click;
var id_click;
var clicked_str;

function fillSuggestions()
{
	var div = document.getElementById("suggestions");
	div.innerHTML = "";

	// traverse the tree:
	if (level3 != null)
		node = database[level1][level2][level3];
	else if (level2 != null)
		node = database[level1][level2];
	else
		node = database[level1];

	currentNode = node;				// set global variable for later use

	for (i = 1; i < node[0].length; ++i) {
		s = node[0][i];
		// break the line into words
		s.split(" ").forEach(function(s1) {
			textNode = document.createElement('span');
			textNode.appendChild(document.createTextNode(s1));
			div.appendChild(textNode);
		});
		// after each line, add a <br>
		div.appendChild(document.createElement("br"));
	}

	// On click: send to green box
	// On double-click: send directly, make sound
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

// Event handler for <tr> in Suggestions (Right Panel)
function word_SingleClick(item) {
	var selection = clicked_str;

	if ($("#delete").prop("checked") === true) {
		// remove from tree
		pos = currentNode[0].indexOf(selection);
		currentNode[0].splice(pos, 1);

		// remove from HTML page
		$("#suggestions span")[pos - 1].remove();

		$("#delete").prop("checked", false);	// reset button
	}
	else if ($("#change").prop("checked") === true) {
		// get value of input box (white)
		new_s = document.getElementById("white-box").value;

		// change item in tree
		pos = currentNode[0].indexOf(selection);
		currentNode[0][pos] = new_s;

		// change HTML in page
		$("#suggestions span")[pos - 1].innerText = new_s;

		$("#change").prop("checked", false);	// reset button
	}
	else {
		// move to <green-box>, make draggable
		textNode = document.createElement('span');
		textNode.id = 'word_' + word_index;
		++word_index;
		// allow dragging for words
		textNode.draggable = true;
		textNode.ondragstart = drag;
		textNode.appendChild(document.createTextNode(selection));
		document.getElementById("green-box").appendChild(textNode);
	}
}

// each suggestion has a double-click event:  enter the text directly
function word_DoubleClick(str) {
	var audio_dicq = new Audio("dicq.ogg");
	audio_dicq.play();
	window.postMessage({type: "FROM_PAGE", text: clicked_str}, "*");
}

function loadDB(pathname)
{
	// Read lexicon (plain text file) into memory, store as tree data structure
	// The tree structure is stored as nested arrays.
	$.get(pathname, function(data) {

		database = new Array();

		var lines = data.split("\n");

		var node = null;
		lines.forEach(function(line) {
			if (line[0] === '\t') {
				// This is a heading line.
				// After '\t' is the section number,
				// Followed by the section title.

				// Get the section sequence
				var section = line.slice(1, line.indexOf(' ') - 1);
				var sequence = section.split('.').map(function(s) {return parseInt(s);});
				// console.log(sequence);

				// Traverse the tree and add a new node (or nodes)
				node = database;
				sequence.forEach(function(number) {
					if (node[number] != null)
						node = node[number];						// traverse the tree
					else
						{
						node[number] = new Array();			// create new node
						node = node[number];
						// store new node's title as first element of new array
						node[0] = [ line.slice(line.indexOf(' ') + 1) ];
						}
				});
			}
			else {	// this is an item line
				node[0][node[0].length] = line;				// add item to end of array
			}
		});

		fillColumn1();
		fillColumn2();
		fillColumn3();
	});
}

function saveDB()
{
	// Plain text file containing all headings and suggestions
	var s0 = "";

	// Traverse tree:
	for (i = 1; i < database.length; ++i) {
		s0 += ("\t" + i + ". ");								// print section number
		s0 += (database[i][0][0] + "\n");					// print heading

		// print contents
		for (h = 1; h < database[i][0].length; ++h)
			s0 += (database[i][0][h] + "\n");

		for (j = 1; j < database[i].length; ++j) {
			s0 += ("\t" + i + "." + j + ". ");				// print section number
			s0 += (database[i][j][0][0] + "\n");			// print heading

			// print contents
			for (h = 1; h < database[i][j][0].length; ++h)
				s0 += (database[i][j][0][h] + "\n");

			for (k = 1; i < database[i][j].length; ++k) {
				s0 += ("\t" + i + "." + j + "." + k + ". "); // print section number
				s0 += (database[i][j][k][0][0] + "\n"); 	// print heading

				// print contents
				for (h = 1; h < database[i][j][k][0].length; ++h)
					s0 += (database[i][j][k][0][h] + "\n");
			}
		}
	}

	$.ajax({
		method: "POST",
		url: "/saveDatabase",
		data: {data: s0},
		success: function(resp) {
			console.log("file saved");
		}
	});

// **** Save to server side with this code:
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
		// allow dragging for words
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

// *********** Functions for manipulating context menu ***********

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
		// parentNode[level3][0] = str;					// add name tag
	}
	else if (level2 != null) {
		parentNode = database[level1];				// find parent
		parentNode.splice(level2, 0, [[str]]);			// add new array
		// parentNode[level2][0] = str;					// add name tag
	}
	else {
		parentNode = database;							// find parent
		parentNode.splice(level1, 0, [[str]]);			// add new array
		// parentNode[level1][0] = str;					// add name tag
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

loadDB("synonym_forest_YKY_database.txt");
// loadDB("database.txt");
console.log("so far so good");
