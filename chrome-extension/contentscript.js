// This script is loaded by the web page "Conceptual Keyboard"
// Its purpose is to relay the user's input to the background script

window.addEventListener("message", function(event) {
	// We only accept messages from browser windows
	if (event.source != window)
		return;

	// This handles selection of which chatroom by the user:
	// This seems to be abolished
	if (event.data.type && (event.data.type == "CHAT_ROOM")) {
		var str = event.data.text;
		console.log("#1: chat room selected (seems abolished): " + str);

		// relay message to background script
		chrome.extension.sendMessage({chatroom: str});
	}

	// This handles a user input:
	if (event.data.type && (event.data.type == "FROM_PAGE")) {
		var str = event.data.text;

		// relay message to background script
		chrome.extension.sendMessage({sendtext: str});
		console.log("#1: msg received and relayed to background script: " + str);
	}

	// This handles a user's copy-to-clipboard action:
	if (event.data.type && (event.data.type == "CLIPBOARD")) {
		var str = event.data.text;
		console.log("#1: copy to clipboard: " + str);

		// relay message to background script
		chrome.extension.sendMessage({clipboard: str});
	}
}, false);

// This seems to be run only once, as the "Conceptual Keyboard" page is loaded.
console.log("Content script #1.01 loaded....");
