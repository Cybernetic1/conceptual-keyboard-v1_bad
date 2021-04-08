// To do: (Misc)
// * export history to file quickly
// * determine automatic log name (seems to be solved by server?)
// * enable using more self-nickname variants
// * on page close save log
// * log what she says
// * forget Typing Log directory files periodically

const white_box = document.getElementById("white-box");

// ********** convert Chinese to Cantonese
function cantonize(str) {
	$.get("/askGenifer/cantonize/" , { data: str }, function(data) {
		// white_box.value = data;
		document.getElementById("pink-box").value = data;
	});
}

// Key pressed on White-Box
white_box.onkeypress = function(e) {
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

	var newWhite = white_box.value;

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
	oldWhite = white_box.value;
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
	str = white_box.value;
	str = simplify(str);
	str = replaceYKY(str);
	recordHistory(str);

	var userName = document.getElementsByName("pidgin-who0")[0].value;
	sendPidgin(userName, str);

	// clear input box
	white_box.value = "";
}, false);

// Send message to Pidgin #1
document.getElementById("send-pidgin1").addEventListener("click", function() {
	str = white_box.value;
	str = simplify(str);
	str = replaceYKY(str);
	recordHistory(str);

	var userName = document.getElementsByName("pidgin-who1")[0].value;
	sendPidgin(userName, str);

	// clear input box
	white_box.value = "";
}, false);
*****/

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

console.log("So far so good, from YKY-input-method.js");
