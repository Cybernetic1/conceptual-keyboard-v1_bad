// This script is loaded by login pages

// To-do:
// * Talk to background.js via "connection" instead of messages

var nickname = "Cybernetic1";

function handleResponse(message) {
	nickname = message.response;
}

function handleError(error) {
	console.log(`LOGIN script error: ${error}`);
}

var sending = browser.runtime.sendMessage({askNickname: "who?"});
sending.then(handleResponse, handleError);

// ******** Execute only once, at start of page-load **********
setTimeout(function() {
	// ****** 寻梦园, fill in password
	if ((document.URL.indexOf("ip131.ek21.com\/oaca") >= 0) ||
		(document.URL.indexOf("ip69.ek21.com") >= 0) ||
		(document.URL.indexOf("ip203.ek21.com") >= 0) ||
		(document.URL.indexOf("ip4.ek21.com") >= 0))
		{
		var nick = sessionStorage.getItem("YKYNickName");
		if (nick != null) {
			console.log("Found nickname:", nick);
			nickname = nick;
			}
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
3000);

// This runs only once, as "login" page is loaded
console.log("Content script #3 = LOGIN (05 Dec 2022) loaded....");
