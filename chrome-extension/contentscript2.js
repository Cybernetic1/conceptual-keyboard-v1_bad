// This script is loaded by the pages "Voov Chat" and "Adult Chat"
// The script has to be reloaded whenever the Chrome Extension is reloaded,
// Seems that only content scripts from the *same* Extension can message
// each other.

// Which chatroom output is selected by user?
// The selection is done on the Conceptual Keyboard page with radio buttons
var voovChat2 = true;
var voovChat = false;
var adultChat = false;
var ip131Chat = false;
var ip203Chat = false;
var ip4Chat = false;
var hkloveChat = false;

var logName = "log.txt";					// Name of the log file, to be filled

var chat_history = new Array();				// log of chat messages

var last_str = "";							// for Voov because it doesn't allow
											// to send duplicate messages

// Write chat history to localhost server via AJAX
function saveLog(name) {
	// get the data-time and make it into filename
	var datetime = new Date();
	var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
			+ "(" +   datetime.getHours() + "-" + datetime.getMinutes() + ")";
	// the string following by "!log " is the Nickname
	logName = name.replace(/ /g, "_") + "." + timeStamp + ".txt";
	console.log("log file name = " + logName);

	var str = chat_history.join();

	$.ajax({
		method: "POST",
		url: "http://localhost:9090/saveChatLog/" + logName,
		data: {data: str},
		// dataType: "String",
		// processData: false,
		success: function(resp) {
			console.log("Successfully saved: " + logName);
		}
	});
}

// ******** Detect mouse-over on ChatRoom page
// Not only set the flags, but we need to broadcast to other content scripts 
document.addEventListener("mouseover", function(){
	if (document.URL.indexOf("hklovechat") >= 0) {
		// console.log("switch to hk love chat (new voov)");
		chrome.extension.sendMessage({chatroom: "hklove"});
		ip131Chat = false; ip203Chat = false; hkloveChat = true; ip4Chat = false;
		voovChat2 = false;
	}
	if (document.URL.indexOf("hk2love") >= 0) {
		// console.log("switch to hk2love");
		chrome.extension.sendMessage({chatroom: "voov2"});
		ip131Chat = false; ip203Chat = false; hkloveChat = false; ip4Chat = false;
		voovChat2 = true;
	}
	if (document.URL.indexOf("ip131") >= 0) {
		// console.log("switch to ip131");
		chrome.extension.sendMessage({chatroom: "ip131"});
		ip131Chat = true; ip203Chat = false; hkloveChat = false; ip4Chat = false;
		voovChat2 = false;
	}
	if (document.URL.indexOf("ip203") >= 0) {
		// console.log("switch to ip203");
		chrome.extension.sendMessage({chatroom: "ip203"});
		ip131Chat = false; ip203Chat = true; hkloveChat = false; ip4Chat = false;
		voovChat2 = false;
	}
	if (document.URL.indexOf("ip4") >= 0) {
		// console.log("switch to ip4");
		chrome.extension.sendMessage({chatroom: "ip4"});
		ip131Chat = false; ip203Chat = false; hkloveChat = false; ip4Chat = true;
		voovChat2 = false;
	}
});

function his() {
	console.log("Chat history:");
	for (i = 0; i < chat_history.length; ++i)
		console.log(chat_history[i]);
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	// console.log(sender.tab ?
	//	"from a content script:" + sender.tab.url :
	//	"from the extension");
	//console.log("processing message");

	// Mouseover event has occurred, update which chatroom is selected:
	if (request.chatroom != null) {
		/*
		if      (request.chatroom == "voov")
			{ voovChat = true; adultChat = false; ip131Chat = false; ip203Chat = false; hkloveChat = false}
		else if (request.chatroom == "adult")
			{ voovChat = false; adultChat = true; ip131Chat = false; ip203Chat = false; hkloveChat = false}
		*/
		if (request.chatroom == "ip131")
			{ ip131Chat = true; ip203Chat = false; hkloveChat = false; ip4Chat = false;
				voovChat2 = false;}
		else if (request.chatroom == "ip203")
			{ ip131Chat = false; ip203Chat = true; hkloveChat = false; ip4Chat = false;
				voovChat2 = false;}
		else if (request.chatroom == "ip4")
			{ ip131Chat = false; ip203Chat = false; hkloveChat = false; ip4Chat = true;
				voovChat2 = false;}
		else if (request.chatroom == "hklove")
			{ ip131Chat = false; ip203Chat = false; hkloveChat = true; ip4Chat = false;
				voovChat2 = false;}
		else if (request.chatroom == "voov2")
			{ ip131Chat = false; ip203Chat = false; hkloveChat = false; ip4Chat = false;
				voovChat2 = true;}

		// else if (request.chatroom == "skype")
		//	{ voovChat = false; adultChat = false; }

		// console.log("2: selected chatroom:" + request.chatroom);
		// console.log("switched to: " + request.chatroom);
		return;
		}

	// Some text has been typed by the user on Conceptual Keyboard:
	// Now we feed that text into the INPUT box of target web page.
	// There are several possible chat rooms:  "Adult", "Voov", "ip131", "ip203", etc
	if (request.sendtext != null) {
		str = request.sendtext;
		// sendResponse({farewell: "2: got msg..."});

		// check for save-log command:
		if (str.indexOf("!log") > -1) {
			// the string following by "!log " is the Nickname, hence 5 chars
			console.log("log person = " + str.slice(5));
			// save log array to file
			// window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
			saveLog(str.slice(5));
			return;
		}

		if (str.indexOf("!clear") > -1) {
			chat_history = new Array();
			console.log("history cleared");
			return;
		}

		if (str.indexOf("!his") > -1) {
			his();
			return;
		}

		if (hkloveChat && document.URL.indexOf("hklovechat") >= 0) {
			//**************** HK Love Chat ***************
			var inputBox = document.getElementsByName("message")[0].contentDocument;
			var inputBox2 = inputBox.getElementById("txtMessage");
			if (last_str == str)		// Voov does not allow to send duplicate messages
				str = " " + str;
			inputBox2.value = str;
			last_str = str;
			var sendButton = inputBox.getElementById("Button1");
			sendButton.click();
			
			//chat_history[chat_history.length] = str + "\n";
			}

		/*
		if (adultChat && document.URL.indexOf("VIP") >= 0) {
			// *********** UT Adult Chatroom ***************
			var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("SAYS")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("c")[0].contentWindow.document.getElementsByClassName("Off2")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}
		*/

		// This one is the new Dream Chat:
		if (ip131Chat && document.URL.indexOf("ip131") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}

		// This one is the new Dream Chat:
		if (ip203Chat && document.URL.indexOf("ip203") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}

		// This one is the new Dream Chat:
		if (ip4Chat && document.URL.indexOf("ip4") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}

		// For HK Love chatroom:
		if (voovChat2 && document.URL.indexOf("hk2love") >= 0) {
			if (last_str == str)		// does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("c")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}
		}
	});

// Indexes of bottom-most lines in the chat frames:
var lastVoovLine = 1;
var lastVoovLine2 = "";
var lastAdultIndex = 1;
var lastIp131Index = 1;
var lastIp203Index = 1;
var lastHkloveIndex = 1;
var lastIp4Index = 1;

// Check activity every second
// If there's activity, message Background Script to play a sound
setInterval( function() {
	timeStamp = Date().slice(16,24);
	
	/*
	if (document.URL.indexOf("voovchat\/") >= 0) {
		chatWin = document.getElementById("chatContainer2");
		if (chatWin == null)
			chatWin = document.getElementById("chatContainer");
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
						chat_history[chat_history.length] = stuff2 + "\n";
						// console.log(timeStamp + stuff2);
					}
					else if (stuff.indexOf("cybernetic1") > -1) {
						stuff2 = stuff.replace("cybernetic1", "*ME*");
						stuff = stuff2.replace("半機械人一號", "*ME*");
						stuff2 = stuff.replace("秘密的說", "");
						chat_history[chat_history.length] = stuff2 + "\n";
						// console.log(timeStamp + stuff2);
					}
				}
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "voov"});
		}
		lastVoovLine = lineNum;
	}
	*/

	if (document.URL.indexOf("hklovechat.com\/") >= 0) {
		chatWin = document.getElementsByName("messages")[0].contentDocument.childNodes[1];
		chatWin2 = chatWin.childNodes[2].childNodes[1].getElementsByClassName("divMessages").divMessages;
		// line number of last line in chat window
		lineNum = chatWin2.childElementCount;
		// need to scan all lines from bottom until last line
		lastIndex = lineNum - 1;
		var alert = false;
		for (i = lastIndex; i > 0; i--) {
			stuff = chatWin2.childNodes[i].innerText.toLowerCase();
			if (stuff == lastVoovLine2)
				break;
			if (stuff.indexOf("對住 cybernetic1") > -1 ||
				stuff.indexOf("對住 metazoan") > -1) {
				// Cannot sound alert on this web page because browser will not enable sounds
				//    when the page is off-focus.  So we have to message background script.
				alert = true;
				stuff2 = stuff.replace("對住 cybernetic1", "");
				stuff3 = stuff2.replace("對住 metazoan", "");
				stuff2 = stuff3.replace("秘密地說", "");
				chat_history[chat_history.length] = stuff2 + "\n";
				// console.log(timeStamp + stuff2);
			}
			else if (stuff.indexOf("cybernetic1") > -1) {
				stuff2 = stuff.replace("cybernetic1", "*ME*");
				stuff3 = stuff2.replace("metazoan", "*ME*");
				stuff2 = stuff3.replace("秘密地說", "");
				chat_history[chat_history.length] = stuff2 + "\n";
				// console.log(timeStamp + stuff2);
			}
		}
		if (alert == true)
			chrome.runtime.sendMessage({alert: "voov2"});
		// Find the last line that's non-empty
		lastVoovLine2 = "top line";
		for (i = lastIndex; i > 0; i--) {
			stuff = chatWin2.childNodes[i].innerText.toLowerCase();
			if (stuff != "") {
				lastVoovLine2 = stuff;
				break;
			}
		}
	}

	if (document.URL.indexOf("VIP") >= 0) {
		// this gives us an HTML element:
		html = document.getElementsByName("m")[0].contentDocument.childNodes[0];
		// this is the <p> element containing the rows:
		chatWin = html.children[1].children[1];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastAdultIndex)) {
			var alert = false;
			for (i = lastIndex; i > lastAdultIndex; i--) {
				if (chatWin.children[i].innerText.indexOf("[半機械人一號]") > -1) {
					// sound alert
					alert = true;
					stuff = chatWin.children[i].innerText;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "adult"});
		}
		lastAdultIndex = lastIndex;
	}

	if (document.URL.indexOf("ip131") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp131Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp131Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對 訪客_半機械人一號") > -1 ||
					stuff.indexOf("只對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "ip131"});
		}
		lastIp131Index = lastIndex;
	}

	if (document.URL.indexOf("ip203") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp203Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp203Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對 訪客_半機械人一號") > -1 ||
					stuff.indexOf("只對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "ip203"});
		}
		lastIp203Index = lastIndex;
	}

	if (document.URL.indexOf("ip4") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp4Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp4Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對 訪客_半機械人一號") > -1 ||
					stuff.indexOf("只對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "ip4"});
		}
		lastIp4Index = lastIndex;
	}

	if (document.URL.indexOf("hk2love.com") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementsByName("a2")[0].contentDocument;
		// this is the element containing the rows:
		chatWin1 = html.childNodes[0].childNodes[1];
		// get down to the last page of messages:
		chatWin = chatWin1.childNodes[chatWin1.childElementCount];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastHkloveIndex)) {
			var alert = false;
			for (i = lastIndex; i > lastHkloveIndex; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對『Yohimbine』") > -1 ||
					stuff.indexOf("只對『Metazoan』") > -1 ||
					stuff.indexOf(">>『Yohimbine』") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				chrome.runtime.sendMessage({alert: "hklove"});
		}
		lastHkloveIndex = lastIndex;
	}
},
1000);

// This seems to be run only once, as each "Chatroom" page is loaded.
console.log("Content script 2.01 loaded....");

/*

// Older function (deprecated)
function saveLog2(name) {
	// get the data-time and make it into filename
	var datetime = new Date();
	var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
			+ "(" +   datetime.getHours() + "-" + datetime.getMinutes() + ")";
	// the string following by "!log " is the Nickname
	logName = name + "." + timeStamp + ".txt";
	console.log("trying to log file: " + logName);
	// save log array to file
	window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
	}

// **** For writing to fileSystem (Chrome extension's temporary file system)
// This is replaced with server-side saving
// Just keep for old sake
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
      var blob = new Blob(chat_history, { type: 'text/plain' });
      fileWriter.write(blob);

      chat_history = new Array();		// Clear history

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

*/

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
