// var app = chrome.runtime.getBackgroundPage();

let myPort = chrome.runtime.connect({name:"PORT-popup"});

// test sound
function onClickButt1() {
	myPort.postMessage({alert: "boing"});
	// browser.runtime.sendMessage({alert: "boing"});
	window.close();
	}

// Reset event stream
function onClickButt4() {
	myPort.postMessage({resetEventStream: "?"});
	// browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 500);
	}

// reload extension
function onClickButt6() {
	chrome.runtime.reload();
	setTimeout(function() {
		window.close();
		}, 500);
	}

document.getElementById('butt1').addEventListener('click', onClickButt1);
document.getElementById('butt4').addEventListener('click', onClickButt4);
document.getElementById('butt6').addEventListener('click', onClickButt6);
