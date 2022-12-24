// NOTE:  This script is not used even in Firefox version

// This script is no longer needed.  Conkey must be run in Chrome, because we need Google Input
//	Method.  The Chrome .js code interacts with background.js via "event stream".

// This script runs in Firefox

// This script is loaded by the web page "Conceptual Keyboard"
// Its purpose is to relay the user's input to the background script

// Not sure why, but this message is not shown in debugger:
console.log("Content script #1 (18-March-2018) loading....");

window.addEventListener("message", function(event) {
	// We only accept messages from browser windows
	if (event.source != window)
		return;

	// This handles selection of which chatroom by the user:
	// **************** This seems to be abolished *******************
	if (event.data.type && (event.data.type == "CHAT_ROOM")) {
		var str = event.data.text;
		// console.log("#1: chat room selected (seems abolished): " + str);

		// relay message to background script
		browser.runtime.sendMessage({chatroom: str});
	}

	// This handles a user input:
	if (event.data.type && (event.data.type == "FROM_PAGE")) {
		var str = event.data.text;

		// relay message to background script
		browser.runtime.sendMessage({sendtext: str});
		// console.log("#1: msg received and relayed to background script: " + str);
	}

	// This handles a user's copy-to-clipboard action:
	/* (No longer needed, handled in YKY-input-method.js, via document.execCommand('copy'))
	if (event.data.type && (event.data.type == "CLIPBOARD")) {
		var str = event.data.text;
		console.log("#1: copy to clipboard: " + str);

		// relay message to background script
		browser.runtime.sendMessage({clipboard: str});
	} */

}, false);

// This seems to be run only once, as the "Conceptual Keyboard" page is loaded.

// if (chrome.runtime.lastError)
//	console.log(chrome.runtime.lastError);

// For some reason, this creates an error in the extension settings page, but seems harmless
console.log("Content script #1 (18-March-2018) loaded....");

// This does not work in background.js because of cross-origin problem.
//var evtSource = new EventSource("fireFoxConn");
//evtSource.onmessage = function(e) {
	//console.log("fireFox: " + e.data);
//}
