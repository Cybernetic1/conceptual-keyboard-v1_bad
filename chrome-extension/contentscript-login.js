// This script is loaded by login pages

// To-do:
// * Talk to background.js via "connection" instead of messages

var nickname = "Cybernetic1";

function handleResponse(response) {
	if (response !== undefined)
		nickname = response;
}

var sending = chrome.runtime.sendMessage({askNickname: "who?"},
handleResponse);

// ******** Execute only once, at start of page-load **********
setTimeout(function() {
	// ****** 寻梦园, fill in password
	if (document.URL.indexOf("ip131.ek21.com\/oaca") >= 0) {
		document.getElementsByClassName("nameform 12")[0].value = nickname;
		document.getElementsByClassName("mainenter")[0].click();
	}

	// ****** chatroom.HK, fill in password
	if (document.URL.indexOf("chatroom.hk") >= 0) {
		if (nickname == "Cybernetik")
			document.getElementById("name").value = "Cybernetik";
		else
			document.getElementById("name").value = "雷米";
		document.getElementById("submit").click();
	}
},
4000);

// This runs only once, as "login" page is loaded
console.log("Content script #3 = LOGIN (21 Sept 2018) loaded....");
