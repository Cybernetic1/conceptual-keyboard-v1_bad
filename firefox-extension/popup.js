// var app = chrome.runtime.getBackgroundPage();

function onClickButt1() {
	browser.runtime.sendMessage({alert: "boing"});
	}

function onClickButt2() {
	var fname = document.getElementById("logName").value;
	browser.runtime.sendMessage({saveLog: fname});
	}

function onClickButt3() {
	browser.runtime.sendMessage({clearHistory: "?"});
	}

function onClickButt4() {
	browser.runtime.sendMessage({resetEventStream: "?"});
	}

function onClickButt5() {
	console.log("Say something")
	}

document.getElementById('butt1').addEventListener('click', onClickButt1);
document.getElementById('butt2').addEventListener('click', onClickButt2);
document.getElementById('butt3').addEventListener('click', onClickButt3);
document.getElementById('butt4').addEventListener('click', onClickButt4);
document.getElementById('butt5').addEventListener('click', onClickButt5);
