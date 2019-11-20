// Background script
// Read from Conceptual Keyboard tab and feed into input box of another tab.

// Identify chatroom pages (if they exist), id's are used for message passing
var adultId = null;
var voovId = null;
var voov2Id = null;
var ip131Id = null;
var ip203Id = null;
var hk2loveId = null
var ip4Id = null;
var ip69Id = null;
var roomHKId = null;

var theNickname = "Cybernetic1";

querying = browser.tabs.query({url: "http://ip131.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip131Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://chatroom.hk/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	roomHKId = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip69.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip69Id = tab.id;
	}});

/*
var querying = browser.tabs.query({url: "http://www.uvoov.com/voovchat/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	voovId = tab.id;
	}});

querying = browser.tabs.query({url: "http://chat.hklovechat.com/frames*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	voov2Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://60.199.209.71/VIP*\/index.phtml"});
querying.then((tabs) => {
	for (var tab of tabs) {
	adultId = tab.id;
	}});

querying = browser.tabs.query({url: "http://60.199.209.72/VIP*\/index.phtml"});
querying.then((tabs) => {
	for (var tab of tabs) {
	adultId = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip203.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip203Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip4.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip4Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://www.hk2love.com/cgi-bin/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	hk2loveId = tab.id;
	}});
*/

// **** Establish connection to script-2

let portScript2;

function connected(p) {
	portScript2 = p;
	console.log("Background: connected to content scripts-2");
	// portScript2.postMessage({greeting: "hi there content script2!"});

	portScript2.onMessage.addListener(backListener);
}

browser.runtime.onConnect.addListener(connected);

// Listen to Node.js server
var evtSource = new EventSource("http://localhost:8484/stream");

evtSource.onmessage = function(e) {
	// Directly output to chatroom
	portScript2.postMessage({sendtext: e.data});
	/*
	if (roomHKId)
		browser.tabs.sendMessage(roomHKId, {sendtext: e.data});
	if (ip131Id)
		browser.tabs.sendMessage(ip131Id, {sendtext: e.data});
	*/
	console.log("Event: " + e.data);
};

// Set up message listener
function backListener(request) {
	// console.log(sender.tab ?	"from a content script:" + sender.tab.url :
	//	"from the extension");

	if (request.selectNickname != null) {
		theNickname = request.selectNickname;
	}

	if (request.askNickname != null) {
		portScript2.postMessage({response: theNickname});
	}

	// Request to change target chatroom
	// The request is sent from contentscript2:mouseover event
	if (request.chatroom != null) {
		// We should send messages to both chatroom's content scripts
		// Let them decide whether to speak or not

		/*
		var querying = browser.tabs.query({url: "http://chat.hklovechat.com/frames*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				voov2Id = tab.id;
				browser.tabs.sendMessage(voov2Id, {chatroom2: request.chatroom});
				}},
			function() {voov2Id = null;});

		querying = browser.tabs.query({url: "http://www.uvoov.com/voovchat/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				voovId = tab.id;
				browser.tabs.sendMessage(voovId, {chatroom2: request.chatroom});
				}},
			function() {voovId = null;});

		querying = browser.tabs.query({url: "http://60.199.209.71/VIP*\/index.phtml"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				adultId = tab.id;
				browser.tabs.sendMessage(adultId, {chatroom2: request.chatroom});
				}},
			function() {adultId = null;});

		querying = browser.tabs.query({url: "http://60.199.209.72/VIP*\/index.phtml"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				adultId = tab.id;
				browser.tabs.sendMessage(adultId, {chatroom2: request.chatroom});
				}},
			function() {adultId = null;});

		querying = browser.tabs.query({url: "http://ip203.ek21.com/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				ip203Id = tab.id;
				browser.tabs.sendMessage(ip203Id, {chatroom2: request.chatroom});
				}},
			function() {ip203Id = null;});

		querying = browser.tabs.query({url: "http://ip4.ek21.com/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				ip4Id = tab.id;
				browser.tabs.sendMessage(ip4Id, {chatroom2: request.chatroom});
				}},
			function() {ip4Id = null;});

		querying = browser.tabs.query({url: "http://www.hk2love.com/cgi-bin/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				hk2loveId = tab.id;
				browser.tabs.sendMessage(hk2loveId, {chatroom2: request.chatroom});
				}},
			function() {hk2loveId = null;});
		*/

		querying = browser.tabs.query({url: "http://chatroom.hk/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				roomHKId = tab.id;
				portScript2.postMessage({chatroom2: request.chatroom});
				// browser.tabs.sendMessage(roomHKId, {chatroom2: request.chatroom});
				}},
			function() {roomHKId = null;});

		querying = browser.tabs.query({url: "http://ip131.ek21.com/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				ip131Id = tab.id;
				portScript2.postMessage({chatroom2: request.chatroom});
				// browser.tabs.sendMessage(ip131Id, {chatroom2: request.chatroom});
				}},
			function() {ip131Id = null;});

		querying = browser.tabs.query({url: "http://ip69.ek21.com/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				ip69Id = tab.id;
				portScript2.postMessage({chatroom2: request.chatroom});
				// browser.tabs.sendMessage(ip69Id, {chatroom2: request.chatroom});
				}},
			function() {ip69Id = null;});

		// console.log("trying to switch to: ", request.chatroom)
		}

	// Request to send text to target chatroom
	if (request.sendtext != null) {
		// sendResponse({farewell: "script 1's msg recieved"});

		// send message to content script 2
		// script 2 will decide which page to actually output
		/*
		if (adultId)
			browser.tabs.sendMessage(adultId, {sendtext: request.sendtext});
		if (voovId)
			browser.tabs.sendMessage(voovId, {sendtext: request.sendtext});
		if (voov2Id)
			browser.tabs.sendMessage(voov2Id, {sendtext: request.sendtext});
		if (ip203Id)
			browser.tabs.sendMessage(ip203Id, {sendtext: request.sendtext});
		if (ip4Id)
			browser.tabs.sendMessage(ip4Id, {sendtext: request.sendtext});
		*/
		if (ip131Id)
			portScript2.postMessage({sendtext: request.sendtext});
			// browser.tabs.sendMessage(ip131Id, {sendtext: request.sendtext});
		if (ip69Id)
			portScript2.postMessage({sendtext: request.sendtext});
			// browser.tabs.sendMessage(ip69Id, {sendtext: request.sendtext});
		if (roomHKId)
			portScript2.postMessage({sendtext: request.sendtext});
			// browser.tabs.sendMessage(roomHKId, {sendtext: request.sendtext});

		// console.log("Sent text to content script 2: ", ip131Id);
		}

	// Request to copy to clipboard, this must be done via background page
	/* (No longer needed, handled in YKY-input-method.js, via document.execCommand('copy'))
	if (request.clipboard != null) {
		// copy to clipboard
		// bg = chrome.extension.getBackgroundPage();
		console.log("copying to clipboard: " + request.clipboard);
		clipboardholder = document.getElementById("clipboardholder");
		clipboardholder.value = request.clipboard;
		clipboardholder.select();
		document.execCommand("Copy");
		} */

	// Request to play an alert sound (must be done thru background page)
	if (request.alert != null) {

		var audio = new Audio(request.alert + ".ogg");
		audio.play();

		//~ if (request.alert == "hk2love") {
			//~ // console.log("hk2love alert")
			//~ var audio = new Audio("hk2love_alert.ogg");
			//~ audio.play();
		//~ }
	}

	// save log:
	if (request.saveLog != null) {

		browser.tabs.query({
			"active": true,
			"currentWindow": true
		}, function (tabs) {
			portScript2.postMessage({sendtext: "!log " + request.saveLog});
			// browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + request.saveLog });
		});

		var audio = new Audio("ip69.ogg");
		audio.play();
	}

	// clear history:
	if (request.clearHistory != null) {

		browser.tabs.query({
			"active": true,
			"currentWindow": true
		}, function (tabs) {
			portScript2.postMessage({sendtext: "!clear"});
			// browser.tabs.sendMessage(tabs[0].id, { sendtext: "!clear" });
		});

		var audio = new Audio("ip69.ogg");
		audio.play();
	}

	// reset event stream:
	if (request.resetEventStream != null) {

		evtSource = new EventSource("http://localhost:8484/stream");

		evtSource.onmessage = function(e) {
			// Directly output to chatroom
			portScript2.postMessage({sendtext: e.data});
			console.log("Event: " + e.data);
		};

		var audio = new Audio("reset-stream.ogg");
		audio.play();
	}

// End of message-listener
}

/* ************** these parts also seem unneeded *************
// *** save log
function onClickContext(info, tab) {
	// console.log("item " + info.menuItemId + " was clicked");
    // console.log("info: " + JSON.stringify(info));
    // console.log("tab: " + JSON.stringify(tab));

	var fname = prompt("Enter log file name", "no-name");

	//Add all you functional Logic here
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** clear history
function onClickContext2(info, tab) {
	console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

	//var fname = prompt("Enter log file name", "no-name");

	//Add all you functional Logic here
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { sendtext: "!clear" });
    });
}


// *** set ip131 ID
function onClickContext3(info, tab) {
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		ip131Id = tabs[0].id;
		console.log("Set ip131 ID = " + ip131Id);
        // browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** set ip69 ID
function onClickContext4(info, tab) {
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		ip69Id = tabs[0].id;
		console.log("Set ip69 ID = " + ip69Id);
        // browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** restart event stream
function onClickContext5(info, tab) {

	evtSource = new EventSource("http://localhost:8484/stream");

	evtSource.onmessage = function(e) {
		// Directly output to chatroom
		if (hk2loveId)
			browser.tabs.sendMessage(hk2loveId, {sendtext: e.data});
		if (ip131Id)
			browser.tabs.sendMessage(ip131Id, {sendtext: e.data});
		// console.log("Event: " + e.data);
		};
}

// Create one test item for each context type.
var contexts = ["page", "image", "editable" //, "selection", "link", "video", "audio"
	];

for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];

    var title = "Save log";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "onclick": onClickContext
		});
    // console.log("'" + context + "' item:" + id);

    var title2 = "Clear history";
    var id2 = chrome.contextMenus.create({
        "title": title2,
        "contexts": [context],
        "onclick": onClickContext2
		});
	// console.log("'" + context + "' item:" + id);

    var title3 = "Set ip131 ID";
    var id = chrome.contextMenus.create({
        "title": title3,
        "contexts": [context],
        "onclick": onClickContext3
		});

    var title4 = "Set ip69 ID";
    var id = chrome.contextMenus.create({
        "title": title4,
        "contexts": [context],
        "onclick": onClickContext4
		});

    var title5 = "Restart event stream";
    var id = chrome.contextMenus.create({
        "title": title5,
        "contexts": [context],
        "onclick": onClickContext5
		});
	}
*/

// var console2 = document.getElementById("console-msgs");
// console2.value = "Background Script .js loaded";
console.log("Background Script.js (11-Oct-2017) loaded");

// *******************************************************************
// *******************************************************************
// *******************************************************************
// Following is some old code, I don't even remember what they're for.
// *******************************************************************
// *******************************************************************
// *******************************************************************

/*
browser.tabs.query(title("YKY input form"), function(tabs) {
	ykyId = tabs[0].id;

	var readYKYInput = function(tabId, changedProps) {
			// We are waiting for the tab we opened to finish loading.
			// Check that the the tab's id matches the tab we opened,
			// and that the tab is done loading.
			if (tabId != ykyId || changedProps.status != "complete")
				return;

			// Passing the above test means this is the event we were waiting for.
			// There is nothing we need to do for future onUpdated events, so we
			// use removeListner to stop geting called when onUpdated events fire.
			// browser.tabs.onUpdated.removeListener(readYKYInput);

			// Try to read what YKY has decided to "enter"


			// Then, send message to 成人聊天室's tab

			// Then, put text into 成人聊天室's input box

			// Look through all views to find the window which will display
			// the screenshot.  The url of the tab which will display the
			// screenshot includes a query parameter with a unique id, which
			// ensures that exactly one view will have the matching URL.
			var views = chrome.extension.getViews();
			for (var i = 0; i < views.length; i++) {
			var view = views[i];
			if (view.location.href == viewTabUrl) {
				view.setScreenshotUrl(screenshotUrl);
				break;
			}
			}
		};
	browser.tabs.onUpdated.addListener(readYKYInput);
})
*/

/*
// The onClicked callback function.
function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1") {
	console.log("background: voovChat selected");
	browser.tabs.sendMessage(adultId, {chatroom: "voovChat"});
	browser.tabs.sendMessage(voovId, {chatroom: "voovChat"});
  } else if (info.menuItemId == "radio2") {
	console.log("background: UT Adult Chat selected");
	browser.tabs.sendMessage(adultId, {chatroom: "adultChat"});
	browser.tabs.sendMessage(voovId, {chatroom: "adultChat"});
  } else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
                " was clicked, state is now: " + info.checked +
                " (previous state was " + info.wasChecked + ")");

  } else {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["page","selection","link","editable","image","video",
                  "audio"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Test '" + context + "' menu item";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
    console.log("'" + context + "' item:" + id);
  }

  // Create a parent item and two children.
  chrome.contextMenus.create({"title": "Test parent item", "id": "parent"});
  chrome.contextMenus.create(
      {"title": "Child 1", "parentId": "parent", "id": "child1"});
  chrome.contextMenus.create(
      {"title": "Child 2", "parentId": "parent", "id": "child2"});
  console.log("parent child1 child2");

  // Create some radio items.
  chrome.contextMenus.create({"title": "VoovChat", "type": "radio",
                              "id": "radio1"});
  chrome.contextMenus.create({"title": "UT Adult Chat", "type": "radio",
                              "id": "radio2"});
  console.log("radio1 radio2");

  // Create some checkbox items.
  chrome.contextMenus.create(
      {"title": "Checkbox1", "type": "checkbox", "id": "checkbox1"});
  chrome.contextMenus.create(
      {"title": "Checkbox2", "type": "checkbox", "id": "checkbox2"});
  console.log("checkbox1 checkbox2");

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  console.log("About to try creating an invalid item - an error about " +
      "duplicate item child1 should show up");
  chrome.contextMenus.create({"title": "Oops", "id": "child1"}, function() {
    if (chrome.extension.lastError) {
      console.log("Got expected error: " + chrome.extension.lastError.message);
    }
  });
});
*/
