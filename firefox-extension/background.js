// Background script
// Read from Conceptual Keyboard tab and feed into input box of another tab.

var theNickname = "Cybernetic1";
var whoIsActive = "roomHK";

var port_roomHK;
var port_ip131;
var port_popup;

function streamEventHandler(e) {
	// Directly output to chatroom
	if (whoIsActive == "ip131")
		port_ip131.postMessage({sendtext: e.data});
	else if (whoIsActive == "roomHK")
		port_roomHK.postMessage({sendtext: e.data});
	console.log("Event: " + e.data);
}	

var evtSource = null;
function initEventSource() {
	// Listen to Node.js server
	evtSource = new EventSource("http://localhost:8484/stream");
	evtSource.onmessage = streamEventHandler;
	evtSource.onerror = function(e) {
		if (evtSource.readyState == 2) {
			evtSource.close();
			setTimeout(initEventSource, 3000);
		}
	};
}

// **** Establish connection to script-2

function connected(p) {
	// title = p.sender.tab.title;
	url = p.sender.url;
	console.log("CONNECTED to tab:", url);
	if (url.indexOf("ip131") >= 0)
		port_ip131 = p;
	else if (url.indexOf("chatroom.hk") >= 0)
		port_roomHK = p;
	else if (url.indexOf("popup.html") >= 0)
		port_popup = p;

	// console.log("Background: CONNECTED to content-scripts-2");
	// portScript2.postMessage({greeting: "hi there content script2!"});

	p.onMessage.addListener(backListener);
	initEventSource();
}

browser.runtime.onConnect.addListener(connected);

// Set up message listener
function backListener(request) {
	// console.log(sender.tab ?	"from a content script:" + sender.tab.url :
	//	"from the extension");

	if (request.selectNickname != null) {
		theNickname = request.selectNickname;
		}

	if (request.askNickname != null) {
		port_ip131.postMessage({response: theNickname});
		port_roomHK.postMessage({response: theNickname});		
		}

	if (request.speak != null) {
		$.ajax({
			method: "POST",
			url: "http://localhost:8484/shellCommand/",
			contentType: "application/json; charset=utf-8",
			dataType: "text",	// This affects the data to be received
			processData: false,
			data: "ekho " + request.speak,
			success: function(resp) {
				console.log("Speak: " + request.speak);
				}
			});
		}

	// Request to change target chatroom
	// The request is sent from contentscript2:mouseover event
	if (request.chatroom != null) {
		// background.js decides which room to speak to
		whoIsActive = request.chatroom;
		// console.log("switched to:", request.chatroom)

		// port_ip131.postMessage({chatroom2: request.chatroom});
		// port_roomHK.postMessage({chatroom2: request.chatroom});

		/*
		querying = browser.tabs.query({url: "http://chatroom.hk/*"});
		querying.then((tabs) => {
			for (var tab of tabs) {
				roomHKId = tab.id;
				portScript2.postMessage({chatroom2: request.chatroom});
				// browser.tabs.sendMessage(roomHKId, {chatroom2: request.chatroom});
				}},
			function() {roomHKId = null;});
		*/
		}

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
			port_ip131.postMessage({sendtext: "!log " + request.saveLog});
			port_roomHK.postMessage({sendtext: "!log " + request.saveLog});
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
			port_ip131.postMessage({sendtext: "!clear"});
			port_roomHK.postMessage({sendtext: "!clear"});
			// browser.tabs.sendMessage(tabs[0].id, { sendtext: "!clear" });
		});

		var audio = new Audio("ip69.ogg");
		audio.play();
	}

	// reset event stream:
	if (request.resetEventStream != null) {
		initEventSource();

		var audio = new Audio("reset-stream.ogg");
		audio.play();
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

// End of message-listener
}

console.log("Background Script.js (21-Nov-2019) RE/LOADED");

/*
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


			// Then, send message to ³ÉÈËÁÄÌìÊÒ's tab

			// Then, put text into ³ÉÈËÁÄÌìÊÒ's input box

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
