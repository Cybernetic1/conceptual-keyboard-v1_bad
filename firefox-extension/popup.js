// var app = chrome.runtime.getBackgroundPage();

// test sound
function onClickButt1() {
	browser.runtime.sendMessage({alert: "boing"});
	window.close();
	}

// save log
function onClickButt2() {
	var fname = document.getElementById("logName").value;
	browser.runtime.sendMessage({saveLog: fname});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// clear history
function onClickButt3() {
	browser.runtime.sendMessage({clearHistory: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// Reset event stream
function onClickButt4() {
	browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// test chosen nickname
function onClickButt5() {
	var name = document.getElementById("Nickname").value;
	browser.runtime.sendMessage({SelectNickname: name});
	console.log("Chosen nickname = ", name);
	setTimeout(function() {
		window.close();
		}, 500);
	}

// reload extension
function onClickButt6() {
	browser.runtime.reload();
	setTimeout(function() {
		window.close();
		}, 500);
	}

// select nickname
function onSelectNickname() {
	browser.runtime.sendMessage({alert: "boing"});
	var name = document.getElementById("Nickname").value;
	browser.runtime.sendMessage({selectNickname: name});
	setTimeout(function() {
		window.close();
		}, 500);
	}

document.getElementById('butt1').addEventListener('click', onClickButt1);
document.getElementById('butt2').addEventListener('click', onClickButt2);
document.getElementById('butt3').addEventListener('click', onClickButt3);
document.getElementById('butt4').addEventListener('click', onClickButt4);
document.getElementById('butt5').addEventListener('click', onClickButt5);
document.getElementById('butt6').addEventListener('click', onClickButt6);

document.getElementById('Nickname').addEventListener('change', onSelectNickname);
