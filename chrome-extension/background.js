// Background script
// Read from Conceptual Keyboard tab and feed into input box of another tab.
// Notice that this *Chrome* extension connects to port *8585*

var whoIsActive = "roomHK";

var port_WeChat;
var port_roomHK;
var port_ip131;
var port_ip4;
// var port_popup;		// ?? What's the use of this?

function streamEventHandler(e) {
	// Directly output to chatroom
	if (whoIsActive == "ip131")
		port_ip131.postMessage({sendtext: e.data});
	else if (whoIsActive == "roomHK")
		port_roomHK.postMessage({sendtext: e.data});
	else if (whoIsActive == "WeChat")
		port_WeChat.postMessage({sendtext: e.data});
	console.log("Event: " + e.data);
}	

var evtSource = null;
function initEventSource() {
	// Listen to Node.js server
	evtSource = new EventSource("http://localhost:8585/stream");
	evtSource.onmessage = streamEventHandler;
	evtSource.onerror = function(e) {
		if (evtSource.readyState == 2) {
			evtSource.close();
			setTimeout(initEventSource, 2000);
		}
	};
}

// **** Establish connection to script-WeChat

function connected(p) {
	// title = p.sender.tab.title;
	url = p.sender.url;
	console.log("CONNECTED to tab:", url);
	if (url.indexOf("ip131") >= 0)
		port_ip131 = p;
	else if (url.indexOf("wechat") >= 0)
		port_WeChat = p;

	// console.log("Background: CONNECTED to content-scripts-2");
	// portScript2.postMessage({greeting: "hi there content script2!"});

	p.onMessage.addListener(backListener);
	initEventSource();
}

chrome.runtime.onConnect.addListener(connected);

// Set up message listener
function backListener(request) {
	// console.log(sender.tab ?	"from a content script:" + sender.tab.url :
	//	"from the extension");

	// Request to change target chatroom
	// The request is sent from contentscript-WeChat: mouseover event
	if (request.chatroom != null) {
		// background.js decides which room to speak to
		whoIsActive = request.chatroom;
		// console.log("switched to:", request.chatroom)
		}

	// Request to play an alert sound (must be done thru background page)
	if (request.alert != null) {

		var audio = new Audio(request.alert + ".ogg");
		audio.play();
	}

	// reset event stream:
	if (request.resetEventStream != null) {
		initEventSource();

		var audio = new Audio("reset-stream.ogg");
		audio.play();
	}
}

console.log("Background Script.js -- WeChat (Jan-2021) RE/LOADED");
