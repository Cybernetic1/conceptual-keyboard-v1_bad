// **************************************************
// *** Cantonese pinyin input similar to Google's ***
// **************************************************

// To do -- AGI related
// ====================
// * use reinforcement learning!!
//		State = current chars in white-box + "tags"
//		Action = each word / char is an action, + tags
//		Reward = what I choose
// * crawl phrases / crawl for math terms
// * run language model --> correct grammar
// * 

// To do (sorted by priority)
// ==========================
// * hide Conkey menu when not in use
// * prevent "undefined" from appearing in text box
// * use Alt-number-keys to choose words
// * some approx pinyins not available (eg. gau -> gao, seun -> seung)
// * 'X' delete safely (ie, keep copy of content)
// * tool tip on chars with pinyins
// * ability to record custom pinyins
// * handle approx pinyins (eg. even with single pinyin letter)
// * be able to modify ranking / pinyin of chars

// To do -- approx pinyin matching
// ===============================
// * Confusion matrix -- need more data, otherwise cannot machine-learn
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

// Done:
// =====
// * intercept keys
// * load pinyin map
// * accept key, display keys so far
// * put list of chars in column
// * allow choosing of chars by number
// * prepare Google exact pinyin list
// * sort according to frequency ranking number
// * break into consonents and vowels
// * created YKY custom pinyin map
// * now can continuously input characters
// * choosing words by mouse
// * choosing chars by mouse
// * Missing '惡 = ok', don't know why?
// * ho -> hou,  (gwan -> kwan is not used)
// * Allow English mode
// * usage buttons from old YKY-input-method.js
// * add char at cursor, not end of white_box text
// * Ctrl keys such as cut-and-paste are affected; use "Windows" key to 切换
// * can choose char with number multiple times
// * backspace on pinyin first and then on input text
// * 

// Flow-chart for preparing canto-pinyins.txt:
// 1. yale-sort-by-freq.txt
// 2. ???....

const white_box = document.getElementById("white-box");
const pinyin_bar = document.getElementById("pinyin-bar");
const columnA = document.getElementById("columnA");
const columnB = document.getElementById("columnB");
const status = document.getElementById("chin-or-eng");

// ************************** Read pinyins into buffer ************************
// or just {}
var p2c = new Object();		// from pinyin look up char
var c2p = new Object();		// from char look up pinyin
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

	loadGooglePins();
}});

// **** Load exact Google pinyins which depends on rank[]:
function loadGooglePins() {
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
			if (p2c[pinyin] == undefined)
				p2c[pinyin] = a;
			else {
				// **** Need to sort according to frequency ranking
				var s = p2c[line.substr(i)];	// sequence to insert 'a' to
				var j = 0;
				ra = rank[a];
				if (ra == undefined)
					ra = 0.0;
				// Below, exploit the fact that 'undefined' in ANY comparison condition is ALWAYS false
				while (rank[s.charAt(j)] > ra)
					++j;
				var s2 = s.substring(0,j) + a + s.substring(j);
				p2c[pinyin] = s2;
				}
			// **** Build c2p[] dictionary, ie, from 字 lookup pinyin
			// at this point we assume a is a single 字
			if (c2p[a] == undefined)
				c2p[a] = pinyin;
			else {
				if (typeof c2p[a] === 'string') {
					c2p[a] = [c2p[a], pinyin];
				}
				else if (typeof c2p[a] === 'object') {
					c2p[a].push(pinyin);
				}
			}
			});
		console.log("Loaded exact-Google-pinyins.txt.");

		// loadDistincts();
	}});
}

// Load distinct sounds in Cantonese, depends on p2c[] from above
function loadDistincts() {
	$.ajax({
	method: "GET",
	url: "/loadDatabase/distinct-sounds",		// Note: use filename without extension
	cache: false,
	success: function(data) {
		for (var i = 0; i < data.length; ++i) {
			var c = data[i];
			y = c2p[c];
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

// These are 'old' pinyins from Google Input Method
const consonants = ['b','ch','d','dy','f','g','gw','gy','h','hm','hy','j','jy','k','kw','ky','l','ly','m','n','ng','ny','p','s','sy','t','ty','w','y'];
const vowels = ['a','aai','aak','aam','aan','aang','aap','aat','aau','ai','ak','am','an','ang','ap','at','au','e','ei','ek','eng','eu','eui','euk','eun','eung','eut','i','ik','im','in','ing','ip','it','iu','o','oi','ok','on','ong','ot','ou','u','ui','uk','un','ung','ut','yu','yun','yut'];

// **** Decompose pinyin into consonant and vowel
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
var current_Wnum = 0;
var last_Wlength = 0;
var chars = "";
var cs = [];
var state = 'A';		// state = A: alpha, 0: numeric
var chin_or_eng = 0		// 0 = Chinese, 1 = English

// **** Intercept keys:
$("#white-box").keydown(function (e) {
	const key = e.key;
	var code = e.keyCode;
	var displayChars = false;

	if (code === 91) {						// "Windows" key
		if (chin_or_eng == 0) {
			chin_or_eng = 1;
			status.innerText = "Eng";
			}
		else {
			chin_or_eng = 0;
			status.innerText = "中";
			}
		e.preventDefault();
		return;
    }

	if (chin_or_eng == 1)
		return;

	if (key === "Escape") {						// Escape
		current_pinyin = "";
		current_num = 0;
		e.preventDefault();
		}

	if (key === "Backspace") {
		if (current_pinyin == "")
			return;				// let backspace act on input text line
		e.preventDefault();
		current_pinyin = current_pinyin.slice(0,-1);
		current_num = 0;
		displayChars = true;
		}

    if (code >= 65 && code <= 90) {				// A-Z
		e.preventDefault();

		if (state == '0') {
			current_pinyin = "";
			state = 'A';
			}
		current_num = 0;
		current_Wnum = 0;
		last_Wlength = 0;
		current_pinyin += String.fromCharCode(code + 32);
		displayChars = true;
		}

	if (displayChars) {
		// **** display chars
		chars = yky[current_pinyin];
		if (chars != undefined) {
			// **** sort by frequency rank:
			cs = chars.split('').sort(rankcompare);
			showChars();

			// match 到了字, display any words with the char
			findWords_char(cs[0]);
			}
		else {
			// 可能有词语
			const r = decompose_pinyin(current_pinyin);
			if (r.length > 1) {
				console.log("p1, p2:", r[0][0], r[1][0]);
				findWords_pinyins(r[0][0], r[1][0]);
				}
			}
		}

	if (key === '`' || (code >= 48 && code <= 57)) {		// 0-9
		if (key === '`')
			code = 48;
		if (!e.altKey) {
			// choose chars
			state = '0';
			current_num = current_num * 10 + (code - 48);
			if (current_num > cs.length)
				current_num = code - 48;
			sendChar(current_num);
			// current_pinyin += '●';
			}
		else {			// choose word
			current_Wnum = current_Wnum * 10 + (code - 48);
			sendWord(current_Wnum);
			}
		e.preventDefault();
		}

	if (code === 32) {						// space chooses 1st char
		// current_pinyin += "●";
		current_num = 0;
		if (state == '0' || current_pinyin == "")
			sendChar(-32);					// send space（唔知有乜用?）
		else
			sendChar(current_num);
		current_pinyin = "";
		e.preventDefault();
		}

	pinyin_bar.innerHTML = current_pinyin;
	});

function sendChar(i) {
	const c = cs[i];
	
	if (i < 0) {						// send plain char as -i（暂时唔知有乜用）
		white_box.value += String.fromCharCode(-i);
		return;
		}
	else if (i <= 9)
		add_to_caret(c);
	else
		// There is an existing character before cursor, needs to be deleted
		add_to_caret(c, remove=1*2);

	findWords_char(c);	// I have chosen char c, should display words with c
	}

function sendWord(i) {
	const w = ws[i];

	if (i <= 9)
		add_to_caret(w);
	else
		// There is an existing character before cursor, needs to be deleted
		add_to_caret(w, remove = last_Wlength);
	last_Wlength = w.length;
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

function showChars() {
	columnA.innerHTML = "";		// clear the contents first

	cs.forEach(function(c, i) {
		// var c = chars.charAt(i);
		// columnA.appendChild(document.createTextNode(nums[i] + '.'));
		var num = i.toString();
		if (i < 10)
			num += " ";

		textNode = document.createElement('span');
		textNode.appendChild(document.createTextNode(num + c));
		columnA.appendChild(textNode);

		// var row = columnA.insertRow(-1)
		// var cell = row.insertCell(0);
		// cell.innerHTML = c;
		});

	// **** specify on-click behavior, for HTML "span" elements:
	$("#columnA span").on('click', function(ev)
		{
		clicked_str = this.textContent;
		var spanItem = this;
		char_SingleClick(spanItem);
		})
		.dblclick(function(ev)
			{
			char_DoubleClick();
			});	
	}

// **** Add string to caret position, may be of length > 1
// Optionally remove a number of chars
function add_to_caret(s, remove=0) {
	const start = white_box.selectionStart;

	white_box.value = white_box.value.slice(0, start - remove) + s + white_box.value.slice(start);

	white_box.selectionStart = start - remove + s.length;
	white_box.selectionEnd   = start - remove + s.length;
	white_box.focus();
	}

// Event handler for single-click of a suggested word
function char_SingleClick(item) {
	const selection = clicked_str;			// the clicked word (string)

	const audio = new Audio("sending.ogg");
	audio.play();

	add_to_caret(selection.slice(-1));
}

function char_DoubleClick() {				// display number, just for testing
	const selection = clicked_str;			// the clicked word (string)

	add_to_caret(selection.slice(0, -1), remove=1*2);
	}

window.addEventListener('beforeunload', function (e) {
	// on application exit:
	driver.close();
	e.returnValue = '';
});

white_box.focus();
console.log("So far so good, from Cantonese-input.js");
