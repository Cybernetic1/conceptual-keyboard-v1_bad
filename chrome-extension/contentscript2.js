// This script is loaded by the pages "Voov Chat" and "Adult Chat"

// Which chatroom output is selected by user?
// The selection is done on the Conceptual Keyboard page with radio buttons
var voovChat = false;
var adultChat = false;

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	// console.log(sender.tab ?
	//	"from a content script:" + sender.tab.url :
	//	"from the extension");

	// A radio button selection has been made, update which chatroom is selected:
	if (request.chatroom != null) {
		if (request.chatroom == "voov")
			{ voovChat = true; adultChat = false; }
		else if (request.chatroom == "adult")
			{ voovChat = false; adultChat = true; }

		// console.log("2: selected chatroom:" + request.chatroom);
		console.log((voovChat ? "voov ON" : "voov OFF") + ", " +
					(adultChat ? "adult ON" : "adult OFF"));
		return;
		}

	// Some text has been typed by the user on Conceptual Keyboard:
	// Now we feed that text into the INPUT box of target web page.
	// There are 2 chat rooms:  "Adult" and "Voov".
	if (request.sendtext != null) {
		str = request.sendtext;
		// sendResponse({farewell: "2: got msg..."});

		if (voovChat && document.URL.indexOf("voov") >= 0) {
			// **************** VoovChat ***************
			//var inputBoxes = document.getElementsByClassName("poptionsBar");
			//if (inputBoxes.length != 0) {
				//// private chat windows
				//inputBox[0].value = str;
				//var sendButton = document.getElementsByClassName("poptionsSend")[0];
				//sendButton.click();
				//}
			//else {
				var inputBox = document.getElementById("optionsBar");
				inputBox.value = str;
				var sendButton = document.getElementById("optionsSend");
				sendButton.click();
			//	}
			}
		else if (adultChat && document.URL.indexOf("VIP") >= 0) {
			// *********** UT Adult Chatroom ***************
			var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("SAYS")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("c")[0].contentWindow.document.getElementsByClassName("Off2")[0];
			sendButton.click();
			}
		}
	});

// Indexes of bottom-most lines in the chat frames:
var lastVoovLine = 1;
var lastAdultIndex = 1;

// Check activity every second
// If there's activity, message Background Script to play a sound
setInterval( function() {
	if (document.URL.indexOf("voov") >= 0) {
		chatWin = document.getElementById("chatContainer");
		// line number of last line in chat window
		lineNum = parseInt( chatWin.lastChild.getAttribute("id") );
		// console.log("we are checking voovChat");
		if (lineNum > lastVoovLine) {
			// check if line contains message to Cybernetic1
			// » Cybernetic1 秘密的說
			lastIndex = chatWin.children.length - 1;
			numberToTest = lineNum - lastVoovLine;
			// Check the last N lines
			for (i = lastIndex; i > lastIndex - numberToTest; i--) {
				if (i >= 0 && chatWin.children[i].innerText.indexOf("» Cybernetic1") > -1) {
					// Cannot sound alert on this web page because browser will not enable sounds
					//    when the page is off-focus.  So we have to message background script.
					chrome.runtime.sendMessage({alert: "voov"});
					// console.log("Alert: someone messaged Cybernetic1 on VoovChat");
				}
			}
		}
		lastVoovLine = lineNum;
	}
	else if (document.URL.indexOf("VIP") >= 0) {
		// this gives us an HTML element:
		html = document.getElementsByName("m")[0].contentDocument.childNodes[0];
		// this is the <p> element containing the rows:
		chatWin = html.children[1].children[1];
		// number of lines in chat win:
		if (chatWin != null) {
			lastIndex = chatWin.childElementCount - 1;
			if (lastIndex > lastAdultIndex) {
				for (i = lastIndex; i > lastAdultIndex; i--) {
					if (chatWin.children[i].innerText.indexOf("給 [半機械人一號] 的密語") > -1) {
						// sound alert
						chrome.runtime.sendMessage({alert: "adult"});
						// console.log("Alert: someone messaged 半機械人一號 on AdultChat");
					}
				}
			}
		}
		lastAdultIndex = lastIndex;
	}
},
1000);

// This seems to be run only once, as the "Adult Chatroom" page is loaded.
console.log("Content script 2 loaded....");

// *******************************************************************
// Following is some old code that tried to determine which was the
// last chatroom tab that was open.  For some unknown reason it didn't work.

/*
 
if (window.document.URL.indexOf("VIP") >= 0) {
	var frame = window.frames["c"];

	frame.addEventListener("mousedown", function() {
		console.log("I am here, and my URL is: " + window.document.URL);

		if (window.document.URL.indexOf("VIP") >= 0) {
			voovChat = false; adultChat = true;
			console.log("adult sensed");
			chrome.runtime.sendMessage({chatroom: "adultChat"});
			};
		});
}
*/

/*
window.addEventListener("focus", function() {
	console.log("I am here, and my URL is: " + window.document.URL);

	if (window.document.URL.indexOf("voov") >= 0) {
		voovChat = true; voovStill = false; adultChat = false;
		console.log("voov sensed");
		chrome.runtime.sendMessage({chatroom: "voovChat"});
		};
});

window.addEventListener('blur', function() {
	if (document.URL.indexOf("voov") >= 0) {
		voovChat = false; voovStll = true; adultChat = false;
		console.log("voov de-activated");
		chrome.runtime.sendMessage({chatroom: "voovStill"});
		};

});

var voovStill = false;
*/
