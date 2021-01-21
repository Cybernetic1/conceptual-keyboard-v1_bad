// This script is loaded by the page "https://web.wechat.com/?&lang=en".
// The script has to be reloaded whenever the Chrome Extension is reloaded.
// This script talks to background.js

// To-do:
// * 

// **** Establish connection with background script
let myPort = chrome.runtime.connect({name:"PORT-script-WeChat"});
// myPort.postMessage({greeting: "HELLO from content script-WeChat"});

// ******** Detect mouse-over on ChatRoom page
// Notify background.js, who decides ultimately which contentscript-* to output to
document.addEventListener("mouseover", function(){
	myPort.postMessage({chatroom: "WeChat"});
	// ip68, ip203, ip4, hklovechat, hk2love, etc...
});

// browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {

myPort.onMessage.addListener(function(request) {
	// console.log("processing message...");
	// console.log(sender.tab ?	"from a content script:" + sender.tab.url :	"from the extension");
	// console.log("roomHKChat =", roomHKChat);
	// console.log("me =", document.URL);

	// Some text has been typed by the user on Conceptual Keyboard:
	// Now we feed that text into the INPUT box of target web page.
	// There are several possible chat rooms:  "Adult", "Voov", "ip131", "ip203", etc
	if (request.sendtext != null)
		{
		str = request.sendtext;

		if (str.indexOf("!test") > -1) {
			console.log("Testing sound...");
			chrome.runtime.sendMessage({alert: "sendFail"});
			return true;
		}

		// This one is for WeChat
		if (document.URL.indexOf("wechat") >= 0)
			{
			// **** Local replacements:
			// var str2 = str.replace(/娘/g, "孃");
			// str = str2;
			var inputBox = document.querySelector("#editArea");
			inputBox.innerText = str;
			inputBox.dispatchEvent(new KeyboardEvent('keydown',{'key':'!'}));
			// and then perhaps click "enter"?
			var sendButton = document.querySelector("#chatArea > div.box_ft.ng-scope > div.action > a");
			// angular.element(sendButton).triggerHandler('click');
			// console.log("button DOM element: " + sendButton);
			// ******* Send 不出去的原因是因为我未在box内打过字!!
			sendButton.click();
			}

		}
		
	return true;
	});

console.log("WeChat: Added message listener");

/* Check activity every 3 seconds
// If there's activity, message Background Script to play a sound
setInterval( function() {
	timeStamp = Date().slice(16,24);

	// ************ WeChat **************
	if (document.URL.indexOf("web.wechat.com\/") >= 0) {
		// this gives us an HTML element of the public chat area:
		// html = document.getElementsByName("main_frame")[0].contentWindow.document;
		// this is the element containing the rows:
		// chatWin = html.getElementsByClassName("messages")[0];
		// if (chatWin !== undefined) {
			//		if (alert == true)
			//			myPort.postMessage({alert: "roomHK"});
		// }
	}
},
3000);
*/

/* ******** Execute only once, at start of page-load **********
setTimeout(function() {
	// ****** WeChat:  nothing to do for now
	if (document.URL.indexOf("web.wechat.com\/") >= 0) {
		// var secretBox = document.getElementsByTagName("frame")[2].contentWindow.document.getElementsByName("secret")[0];
		// secretBox.checked = true;
	}
},
2000);
*/

// This seems to be run only once, as each "Chatroom" page is loaded.
console.log("Content script -- WeChat (Jan 2021) RE/LOADED....");
