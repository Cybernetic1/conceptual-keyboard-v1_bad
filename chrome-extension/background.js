// Background script
// Read from Conceptual Keyboard tab and feed into input box of another tab.

// To-do:
// * log chat messages to file, perhaps using chrome.fileSystem
//			-- save all chat messages directed to me / by me to an array
//			-- on "save key", save array to file (with date/time), clear array

// Identify chatroom pages (if they exist), id's are used for message passing
var adultId = null;
var voovId = null;

chrome.tabs.query({url: "http://www.uvoov.com/voovchat/index.php*"}, function(result) {
	if (result.length != 0)
		voovId = result[0].id;
	else
		voovId = null;
	});

chrome.tabs.query({url: "http://60.199.209.71/VIP*/index.phtml"}, function(result) {
	if (result.length != 0)
		adultId = result[0].id;
	});

chrome.tabs.query({url: "http://60.199.209.72/VIP*/index.phtml"}, function(result) {
	if (result.length != 0)
		adultId = result[0].id;
	});

// Set up message listener
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		// console.log(sender.tab ?	"from a content script:" + sender.tab.url : 	"from the extension");

	// Request to change target chatroom
	if (request.chatroom != null) {
		// We should send messages to both chatroom's content scripts
		// Let them decide whether to speak or not

		chrome.tabs.query({url: "http://www.uvoov.com/voovchat/index.php*"}, function(result) {
			if (result.length != 0) {
				voovId = result[0].id;
				chrome.tabs.sendMessage(voovId, {chatroom: request.chatroom});
				}
			else
				voovId = null;
			});

		chrome.tabs.query({url: "http://60.199.209.71/VIP*/index.phtml"}, function(result) {
			if (result.length != 0) {
				adultId = result[0].id;
				chrome.tabs.sendMessage(adultId, {chatroom: request.chatroom});
				}
			});

		chrome.tabs.query({url: "http://60.199.209.72/VIP*/index.phtml"}, function(result) {
			if (result.length != 0) {
				adultId = result[0].id;
				chrome.tabs.sendMessage(adultId, {chatroom: request.chatroom});
				}
			});

		}

	// Request to send text to target chatroom
	if (request.sendtext != null) {
		// sendResponse({farewell: "script 1's msg recieved"});

		// send message to content script 2
		if (adultId)
			chrome.tabs.sendMessage(adultId, {sendtext: request.sendtext});
		if (voovId)
			chrome.tabs.sendMessage(voovId, {sendtext: request.sendtext});
		}

	// Request to copy to clipboard, this must be done via background page
	if (request.clipboard != null) {
		// copy to clipboard
		// bg = chrome.extension.getBackgroundPage();
		clipboardholder = document.getElementById("clipboardholder");
		clipboardholder.value = request.clipboard;
		clipboardholder.select();
		document.execCommand("Copy");
		console.log("copied to clipboard: " + request.clipboard);
		}

	// Request to play an alert sound (must be done thru background page)
	if (request.alert != null) {
		if (request.alert == "voov") {
			// console.log("voov alert")
			var audio = new Audio("msg_alert.ogg");
			audio.play();
		}

		if (request.alert == "adult") {
			// console.log("adult alert")
			var audio = new Audio("msg_alert2.ogg");
			audio.play();
		}
	}

});

console.log("background.js is loaded....");

// *******************************************************************
// *******************************************************************
// *******************************************************************
// Following is some old code, I don't even remember what they're for.
// *******************************************************************
// *******************************************************************
// *******************************************************************

/*
chrome.tabs.query(title("YKY input form"), function(tabs) {
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
			// chrome.tabs.onUpdated.removeListener(readYKYInput);

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
	chrome.tabs.onUpdated.addListener(readYKYInput);
})
*/

/*
// The onClicked callback function.
function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1") {
	console.log("background: voovChat selected");
	chrome.tabs.sendMessage(adultId, {chatroom: "voovChat"});
	chrome.tabs.sendMessage(voovId, {chatroom: "voovChat"});
  } else if (info.menuItemId == "radio2") {
	console.log("background: UT Adult Chat selected");
	chrome.tabs.sendMessage(adultId, {chatroom: "adultChat"});
	chrome.tabs.sendMessage(voovId, {chatroom: "adultChat"});
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
