// This script is loaded by the pages "Voov Chat" and "Adult Chat"
// The script has to be reloaded whenever the Chrome Extension is reloaded,
// Seems that only content scripts from the *same* Extension can message
// each other.

// Which chatroom output is selected by user?
// The selection is done on the Conceptual Keyboard page with radio buttons
var voovChat = true;
var adultChat = false;

var logName = "log.txt";					// Name of the log file, to be filled

var history = new Array();					// log of chat messages

// For writing to fileSystem
function onInitFs(fs) {
   fs.root.getFile(logName, {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Log saved.');
      };

      fileWriter.onerror = function(e) {
        console.log('Save log failed: ' + e.toString());
      };

      // Create a new Blob and write it to log.txt.
      var blob = new Blob(history, { type: 'text/plain' });
      fileWriter.write(blob);

      history = new Array();		// Clear history

    }, errorHandler);

  }, errorHandler);

}

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

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
		// else if (request.chatroom == "skype")
		//	{ voovChat = false; adultChat = false; }

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

		// check for save-log command:
		if (str.indexOf("!log") > -1) {
			// get the data-time and make it into filename
			var datetime = new Date();
			var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
					+ "_" +   datetime.getHours() + "-" + datetime.getMinutes();
			// the string following by "!log " is the Nickname
			logName = str.slice(5) + "." + timeStamp + ".txt";
			console.log("trying to log file: " + logName);
			// save log array to file
			window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
		}
		else if (str.indexOf("!clear") > -1) {
			history = new Array();
			console.log("history cleared");
		}
		else if (voovChat && document.URL.indexOf("voov") >= 0) {
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
			
			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			history[history.length] = str + "\n";
			}
		}
	});

// Indexes of bottom-most lines in the chat frames:
var lastVoovLine = 1;
var lastAdultIndex = 1;

// Check activity every second
// If there's activity, message Background Script to play a sound
setInterval( function() {
	timeStamp = Date().slice(16,24);
	if (document.URL.indexOf("voovchat\/index.php") >= 0) {
		chatWin = document.getElementById("chatContainer2");
		// line number of last line in chat window
		lineNum = chatWin.children.length;
		// console.log("we are checking voovChat");
		if (lineNum > lastVoovLine) {
			// check if line contains message to Cybernetic1
			// » Cybernetic1 秘密的說
			lastIndex = chatWin.children.length - 1;
			numberToTest = lineNum - lastVoovLine;
			// Check the last N lines
			var alert = false;
			for (i = lastIndex; i > lastIndex - numberToTest; i--) {
				if (i >= 0) {
					stuff = chatWin.children[i].innerText.toLowerCase();
					if (stuff.indexOf("» cybernetic1") > -1 ||
						stuff.indexOf("» 半機械人一號") > -1) {
						// Cannot sound alert on this web page because browser will not enable sounds
						//    when the page is off-focus.  So we have to message background script.
						alert = true;
						stuff2 = stuff.replace("cybernetic1", "");
						stuff = stuff2.replace("半機械人一號", "");
						stuff2 = stuff.replace("秘密的說", "");
						history[history.length] = stuff2 + "\n";
						console.log(timeStamp + stuff2);
					}
					else if (stuff.indexOf("cybernetic1") > -1) {
						stuff2 = stuff.replace("cybernetic1", "*ME*");
						stuff = stuff2.replace("半機械人一號", "*ME*");
						stuff2 = stuff.replace("秘密的說", "");
						history[history.length] = stuff2 + "\n";
						console.log(timeStamp + stuff2);
					}
				}
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "voov"});
		}
		lastVoovLine = lineNum;
	}
	else if (document.URL.indexOf("VIP") >= 0) {
		// this gives us an HTML element:
		html = document.getElementsByName("m")[0].contentDocument.childNodes[0];
		// this is the <p> element containing the rows:
		chatWin = html.children[1].children[1];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastAdultIndex)) {
			var alert = false;
			for (i = lastIndex; i > lastAdultIndex; i--) {
				if (chatWin.children[i].innerText.indexOf("給 [半機械人一號] 的密語") > -1) {
					// sound alert
					alert = true;
					stuff = chatWin.children[i].innerText;
					history[history.length] = stuff + "\n";
					console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "adult"});
		}
		lastAdultIndex = lastIndex;
	}
},
1000);

// This seems to be run only once, as each "Chatroom" page is loaded.
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
