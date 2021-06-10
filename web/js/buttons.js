// ******************************* Menu buttons ********************************

function send2Chat(str) {
	// **** Now this is to Chatroom.HK only
	var str2 = str.replace(/\//g, "|");
	str = str2.replace(/\'/g, "`");
	
	$.ajax({
		method: "POST",
		url: "./fireFox",
		data: str,
		success: function(resp) {
			// console.log("Fire: " + str);
		}
	});
}

// ************* This is used when 'enter' is pressed or '↵' button is clicked:
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

	/*
	if (to_skype) {			// Try to send text to Skype chat dialog
		Skype.ui({				// don't know how to do it yet...
			name: "",
			element: "",
			participants: [""]
		});
	}
	*/

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

document.getElementById("send-white").addEventListener("click", quicksend, false);

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
		// var msg = successful ? 'success' : 'failure';
		// console.log('Copying text:' + msg);
	} catch (err) {
		console.error('Oops, unable to copy:', err);
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
		// var msg = successful ? 'success' : 'failure';
		// console.log('Copying text:' + msg);
	} catch (err) {
		console.error('Oops, unable to copy:', err);
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

document.getElementById("clear-white").addEventListener("click", function() {
	document.getElementById("pinyin-box").innerHTML = "";
	white_box.value = "";
	white_box.focus();
	upperLevels.innerHTML = ""
	main_list = [];
	current_pinyin = "";
	pinyin_bar.innerText = "";
	history_view_index = -1;		// No longer in history mode
}, false);

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

document.getElementById("quotes").addEventListener("click", function(e) {
	str = white_box.value;
	var quoted = "「" + str + "」";
	if (e.altKey || e.ctrlKey || e.shiftKey)
		quoted = "『" + str + "』";
	white_box.value = quoted;
}, false);

document.getElementById("parentheses").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "（" + str + "）";
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

// Send message to DreamLand
var last_dream = ""
document.getElementById("to-dream").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str = simplify(str);
	str = replaceYKY(str);
	recordHistory(str);
	if (str == last_dream)
		str = "..." + str;
	last_dream = str;

	// send to dreamland.py
	$.ajax({
		method: "POST",
		url: "./dreamland",
		data: str,
		success: function(resp) {
		// nothing
		}
	});

	// clear input box
	document.getElementById("white-box").value = "";
}, false);

// ==== For dealing with Drop-down menu ====

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

var menuShowing = true;

document.getElementById("▼").addEventListener("click", function() {
	if (menuShowing) {
		document.getElementById("mid-levels").style.display = "none";
		document.getElementById("bottom").style.display = "none";
		document.getElementById("upperLevels").style.height = "350px";
		document.getElementById("upperLevels").style.display = "initial";
		}
	else {
		document.getElementById("upperLevels").style.display = "none";
		document.getElementById("mid-levels").style.display = "initial";
		document.getElementById("bottom").style.display = "initial";
		}

	menuShowing = !menuShowing;
	var audio = new Audio("sending.ogg");
	audio.play();
});

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
		//document.getElementById("pinyin-box").value = str;
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
		data: "wmctrl -r 'iCant' -e 0,-1,-1,620,450",
		success: function(resp) {
			console.log("Shell command, wmctrl");
		}
	});
}, false);

/*
document.getElementById("send-clipboard").addEventListener("click", function() {
	str = white_box.value;
	str = simplify(str);
	str = replaceYKY(str);
	white_box.value = str;

	white_box.focus();
	white_box.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	recordHistory(str);

	// clear input box
	white_box.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);
*/

// document.getElementById("flush-typings").addEventListener("click", flushTypings, false);

/* Genifer:  save input-output pair in ./training directory
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
*/

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
