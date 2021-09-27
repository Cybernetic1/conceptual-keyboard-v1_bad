// var app = chrome.runtime.getBackgroundPage();

// **** These commands are processed in background.js ****
let myPort = browser.runtime.connect({name:"PORT-popup"});

// test sound
function onClickButt1() {
	myPort.postMessage({alert: "boing"});
	// browser.runtime.sendMessage({alert: "boing"});
	window.close();
	}

// save log
function onClickButt2() {
	var fname = document.getElementById("logName").value;
	myPort.postMessage({saveLog: fname});
	// browser.runtime.sendMessage({saveLog: fname});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// clear history
function onClickButt3() {
	myPort.postMessage({clearHistory: "?"});
	// browser.runtime.sendMessage({clearHistory: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// Reset event stream
function onClickButt4() {
	myPort.postMessage({showHistory: "?"});
	// browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// test chosen nickname
function onClickButt5() {
	var name = document.getElementById("Nickname").value;
	myPort.postMessage({selectNickname: name});
	// browser.runtime.sendMessage({selectNickname: name});
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

// Reset event stream (?) -- seems not needed anymore
function onClickButt7() {
	myPort.postMessage({resetEventStream: "?"});
	// browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// select nickname
function onSelectNickname() {
	myPort.postMessage({alert: "boing"});
	// browser.runtime.sendMessage({alert: "boing"});
	var name = document.getElementById("Nickname").value;
	myPort.postMessage({selectNickname: name});
	// browser.runtime.sendMessage({selectNickname: name});
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
document.getElementById('butt7').addEventListener('click', onClickButt6);

document.getElementById('Nickname').addEventListener('change', onSelectNickname);
