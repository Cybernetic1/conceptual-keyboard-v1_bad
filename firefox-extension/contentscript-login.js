// This script is loaded by login pages

// To-do:
// *

// ******** Execute only once, at start of page-load **********
setTimeout(function() {
	// ****** 寻梦园, fill in password
	if (document.URL.indexOf("ip131.ek21.com\/oaca") >= 0) {
		document.getElementsByClassName("nameform 12")[0].value = "Cybernetic1";
		document.getElementsByClassName("mainenter")[0].click();
	}

	// ****** chatroom.HK, fill in password
	if (document.URL.indexOf("chatroom.hk") >= 0) {
		document.getElementById("name").value = "Cybernetic";
		document.getElementById("submit").click();
	}
},
3000);

// This seems to be run only once, as each "Chatroom" page is loaded.
console.log("Content script #3 = LOGIN (21 Sept 2018) loaded....");
