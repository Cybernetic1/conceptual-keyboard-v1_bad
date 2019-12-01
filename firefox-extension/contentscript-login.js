// This script is loaded by login pages

// To-do:
// * Talk to background.js via "connection" instead of messages

var nickname = "Cybernetic1";

function handleResponse(message) {
	nickname = message.response;
}

function handleError(error) {
	console.log(`LOGIN script rrror: ${error}`);
}

var sending = browser.runtime.sendMessage({askNickname: "who?"});
sending.then(handleResponse, handleError);

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
			document.getElementById("name").value = "Cybernetic";
		document.getElementById("submit").click();
	}
},
3000);

// This runs only once, as "login" page is loaded
console.log("Content script #3 = LOGIN (21 Sept 2018) loaded....");
