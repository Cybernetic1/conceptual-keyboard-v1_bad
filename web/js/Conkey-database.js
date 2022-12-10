// ***********************************************
// *** Code for storing the database in a tree ***
// *** and for handling the user interface     ***
// ***********************************************

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

// Global variable for storing clicked HTML "span" element
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
			item_SingleClick(imgWord);
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
	// may depend on where (in which Box) the span element is located
	// the location can be given by [DOMelement].parentNode or .parentElement
	$("#suggestions span").on('click', function(ev)
		{
		clicked_str = this.textContent;
		var spanItem = this;
		item_SingleClick(spanItem);
		})
		.dblclick(function(ev)
			{
			item_DoubleClick();
			});

	// On right click: add to front-of-text in White Box
	$("#suggestions span").on('contextmenu', function(ev)
		{
		// Play a sound
		var audio = new Audio("sending.ogg");
		audio.play();
		clicked_str = this.textContent;
		// add to front-of-text:
		old_str = white_box.value;
		white_box.value = clicked_str + old_str;
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
function item_SingleClick(item) {
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
		new_s = white_box.value;

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
		new_s = "┆" + white_box.value;

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
		white_box.value += selection;
	}
}

// Event handler for double-click on a suggested word
// Action: send the text directly to output
function item_DoubleClick() {
	const box = white_box;
	box.value = box.value.slice(0, -2 * clicked_str.length);

	// **** Perhaps no need to play sound, because single-click does
	// var audio = new Audio("sending.ogg");
	// audio.play();

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

	$.ajax({
	method: "GET",
	url: "/loadDatabase/" + dbname,		// Note: name with extension
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
		console.log("Loaded Conkey database.");
		},
	error: function(XMLHttpRequest, textStatus, errorThrown) {
		console.log("Load Conkey database error.");
		console.log("Status: " + textStatus);
		console.log("Error: " + errorThrown);
		alert("Load Conkey database error");
		}
	});
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

// *********** Functions for manipulating tree categories ***********

// insert White-Box item below currently selected menu node
document.getElementById("insert").addEventListener("click", function() {
	str = white_box.value;

	// add to tree:
	currentNode[0][currentNode[0].length] = str;

	// just add to #suggestions and refresh
	fillSuggestions();
}, false);

// add a child node to tree
document.getElementById("add-child").addEventListener("click", function() {
	str = white_box.value;

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

document.getElementById("loadDB").addEventListener("click", function() {
	var dbname = prompt("Enter DB name (.txt)","database_default.txt");
	// In Vivaldi app mode, 'prompt' function does not work and always returns null
	if (dbname == null)
		dbname = document.getElementById("pink-box").value;
	loadDB(dbname);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("saveDB").addEventListener("click", function() {
	var dbname = prompt("Enter DB name (.txt)","database_default.txt");
	// In Vivaldi app mode, 'prompt' function does not work and always returns null
	if (dbname == null)
		dbname = document.getElementById("red-box").value;
	saveDB(dbname);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

// *********************** Initialize by loading database **********************

loadDB("database_default.txt");
