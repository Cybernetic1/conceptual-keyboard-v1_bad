// **************************************************
// *** Cantonese pinyin input similar to Google's ***
// **************************************************

// To do -- AGI related
// ====================
// * crawl phrases / crawl for math terms
// * run language model --> correct grammar
// * 

// To do
// =====
// * cannot continuously input characters
// * ability to record custom pinyins
// * handle approx pinyins
// * be able to modify ranking / pinyin of chars
// * allow choosing of chars by mouse
// * perhaps send to Conkey main window

// To do -- approx pinyin matching
// ===============================
// * the file scraped from Google actually contains (Google's) approx matching results,
//		which we may use as a reference or as initial data
// * perhaps reverse engineer Google's approx matching?
// * there are 635 distinct Cantonese pinyins in 粵語音節表 (Table of Cantonese Syllables)
// * a potential problem:  too many candidates, that depends on how good the ranking quality is
// * try to extract all approx matches by Google

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
//		- how / where to store?
//		- Neo4j
// * 词语是有的，问题是怎样 recall？
//		- has head or tail
//		- how should be organize the keys?
// * With Neo4j:
//		- store all chars and all words (n-grams) as nodes
//		- store "char belongs to word" relations
//		- later, words can be semantically clustered
// * each phrase is addressed by 1 or more key?  It may be too slow to search from zero
// * but it may be the job of an RNN -- output a few keys
// * OR, cluster phrases, map chars --> semantic clusters
// * OR, build semantically-organized tree structure
// * Google has some "consonent abbreviation" for phrases
// *

// Done:
// =====
// * intercept keys
// * load pinyinMap
// * accept key, display keys so far
// * put list of chars in column
// * allow choosing of chars by number
// * prepare Google exact pinyin list
// * sort according to frequency ranking number
// * break into consonents and vowels
// * created YKY custom pinyin map
// * 

// Flow-chart for preparing canto-pinyins.txt:
// 1. yale-sort-by-freq.txt
// 2. ???....

// This web driver allows to talk to Neo4j via web socket
var driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'l0wsecurity') );

const column2 = document.getElementById("column2");

async function findWords(c) {
	const session = driver.session();

	try {
		const result = await session.run(
			"MATCH (n:Char {char: $char}) -[:In]->(m) RETURN (n),(m)",
			{char: c} );
		console.log(result.records.length);

		column2.innerHTML = "";		// clear the contents first
		result.records.reverse().forEach(function(r, i) {
			const node = r.get(1);
			const word = node.properties.chars;

			var num = i.toString() + '.';
			textNode = document.createElement('span');
			textNode.appendChild(document.createTextNode(num + word));
			column2.appendChild(textNode);

			// console.log(node.properties.chars);
			});
		} finally {
		await session.close()
		}
	}

// ************************** Read pinyins into buffer ************************
// or just {}
var pin = new Object();		// from pinyin look up char
var yin = new Object();		// from char look up pinyin
var yky = new Object();		// from char look up pinyin
var approx = new Object();

// **** Read YKY custom pinyins file ****
$.ajax({
	method: "GET",
	url: "/loadDatabase/YKY-custom-pinyins",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");
		lines.forEach(function(line) {
			if (line[0] == '/')
				return;
			else if (yky[line.substr(1)] == undefined)
				yky[line.substr(1)] = line[0];
			else
				yky[line.substr(1)] += line[0];
			});
		console.log("Loaded YKY-custom-pinyins.txt\n");
}});

var rank = new Object();

// **** Character frequencies (relative, normalized)
$.ajax({
method: "GET",
url: "/loadDatabase/char-rel-freq",		// Note: use filename without extension
cache: false,
success: function(data) {
	var lines = data.split("\n");
	lines.forEach(function(line) {
		var c = line.charAt(0);		// Chinese character
		var c2 = line[1];			// should be ','
		var r = line.substr(2);		// rank

		// *** takes care of 2-byte character code:
		if (line.codePointAt(0) > 65535) {
			c = String.fromCharCode(line.charCodeAt(0), line.charCodeAt(1));
			c2 = line[2];
			r = line.substr(3);
			}

		if (!isNaN(c2) && c2 != 44)		// 44 = comma
			console.log("char-rel-freq.txt corrupt:", line);
		else if (rank[c] == undefined)
			rank[c] = parseFloat(r);
		else
			console.log("char-rel-freq.txt duplicate:", c, line);
		});
	console.log("testing rank['是'] =", rank['是']);
	console.log("Loaded char-rank.txt.");

	loadPinyins();
}});

// **** Load exact Google pinyins which depends on rank[]:
function loadPinyins() {
	$.ajax({
	method: "GET",
	url: "/loadDatabase/exact-Google-pinyins",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		var lines = data.split("\n");
		lines.forEach(function(line) {
			// line format:  "字pinyin" or "字字pinyin"
			var n1 = line.charCodeAt(1);
			var n2 = line.charCodeAt(2);
			var i = 1;
			if (n1 >= 97 && n1 < 123)
				i = 1;
			else if (n2 >= 97 && n2 < 123)
				i = 2;
			var a = line.substr(0,i);		// 字 or 字字 to be added
			if (i == 2)	{
				// console.log("ignored: ", a);
				return;						// ignore n-grams > 1
				}
			var pinyin = line.substr(i);
			if (pin[pinyin] == undefined)
				pin[pinyin] = a;
			else {
				// **** Need to sort according to frequency ranking
				var s = pin[line.substr(i)];	// sequence to insert 'a' to
				var j = 0;
				ra = rank[a];
				if (ra == undefined)
					ra = 0.0;
				// Below, exploit the fact that 'undefined' in ANY comparison condition is ALWAYS false
				while (rank[s.charAt(j)] > ra)
					++j;
				var s2 = s.substring(0,j) + a + s.substring(j);
				pin[pinyin] = s2;
				}
			// **** Build yin[] dictionary, ie, from 字 lookup pinyin
			// at this point we assume a is a single 字
			if (yin[a] == undefined)
				yin[a] = pinyin;
			else {
				if (typeof yin[a] === 'string') {
					yin[a] = [yin[a], pinyin];
				}
				else if (typeof yin[a] === 'object') {
					yin[a].push(pinyin);
				}
			}
			});
		console.log("Loaded exact-Google-pinyins.txt.");

		// loadDistincts();
	}});
}

// Load distinct sounds in Cantonese, depends on pin[] from above
function loadDistincts() {
	$.ajax({
	method: "GET",
	url: "/loadDatabase/distinct-sounds",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		for (var i = 0; i < data.length; ++i) {
			var c = data[i];
			y = yin[c];
			if (y == undefined) {
				console.log(c + ",?");
				}
			else if (typeof y === "string") {
				kn = k_n(y);
				console.log(c + ',' + kn[0] + ',' + kn[1]);
				}
			else {
				y.forEach(function(x) {
					kn = k_n(x);
					console.log(c + ',' + kn[0] + ',' + kn[1]);
					});
				}
			}
		console.log("Loaded distinct-sounds.txt.");
		}
	});
}

const consonants = ['b','ch','d','dy','f','g','gw','gy','h','hm','hy','j','jy','k','kw','ky','l','ly','m','n','ng','ny','p','s','sy','t','ty','w','y'];

const vowels = ['a','aai','aak','aam','aan','aang','aap','aat','aau','ai','ak','am','an','ang','ap','at','au','e','ei','ek','eng','eu','eui','euk','eun','eung','eut','i','ik','im','in','ing','ip','it','iu','o','oi','ok','on','ong','ot','ou','u','ui','uk','un','ung','ut','yu','yun','yut'];

function k_n(pinyin) {
	var c = pinyin.substring(0,1);
	var cc = pinyin.substring(0,2);
	var k = "";
	var n = "";
	if (consonants.includes(cc)) {
		k = cc;
		n = pinyin.substring(2);
		}
	else if (consonants.includes(c)) {
		k = c;
		n = pinyin.substring(1);
		}
	else
		n = pinyin;
	return [k, n];
}

var current_pinyin = "";
var current_num = 0;
var chars = "";
var cs = [];

$("#white-box").keydown(function (e) {
	if (e.which == 27) {						// Escape
		current_pinyin = "";
		current_num = 0;
		e.preventDefault();
    }

    if (e.which >= 65 && e.which <= 90) {		// A-Z
		current_num = 0;
		current_pinyin += String.fromCharCode(e.which + 32);

		// **** display chars
		chars = yky[current_pinyin];
		if (chars != undefined) {
			// **** sort by frequency rank:
			cs = chars.split('').sort(rankcompare);
			showChars();

			// after displaying char, display n-grams
			findWords(cs[0]);
			}

		e.preventDefault();
    }

	if (e.which >= 48 && e.which <= 57) {		// 0-9
		// choose chars
		current_num = current_num * 10 + (e.which - 48);
		sendChar(current_num);
		current_pinyin += '●';
		e.preventDefault();
	}

	if (e.which == 32) {						// space chooses 1st char
		current_pinyin += "●";
		current_num = 0;
		sendChar(current_num);
		e.preventDefault();
    }

	document.getElementById("pinyin-bar").innerHTML = current_pinyin;
});

function sendChar(i)
{
	if (i <= 9)
		document.getElementById("white-box").value += cs[i];
	else {
		element = document.getElementById("white-box");
		element.value = element.value.slice(0,-1) + cs[i];
	}
}

// Javascript's sort order: from small to big
// Our ranking requires: from big to small
// so the order relation is REVERSED.
function rankcompare(a, b) {
	ra = rank[a];
	rb = rank[b];
	// undefined behaves like 0
	if (ra == undefined)
		return 1;		// 0 > b = always false
	if (rb == undefined)
		return -1;		// a > 0 = always true
	return ra > rb ? -1 : 1;
	}

function showChars()
{
	var column1 = document.getElementById("column1");
	column1.innerHTML = "";		// clear the contents first

	cs.forEach(function(c, i) {
		// var c = chars.charAt(i);
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
		});
}

column2.innerHTML = "test";		// clear the contents first

window.addEventListener('beforeunload', function (e) {
	// on application exit:
	driver.close();
	e.returnValue = '';
});

console.log("So far so good, from Cantonese-input.js");
