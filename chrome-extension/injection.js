// **** Important answers:
// https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-variables-and-functions
// https://stackoverflow.com/questions/11172128/fire-keydown-event-in-google-chrome-extension
// https://stackoverflow.com/questions/596481/is-it-possible-to-simulate-key-press-events-programmatically

var keyboardEvent = document.createEvent('KeyboardEvent');
var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';

keyboardEvent[initMethod](
  'keydown', // event type: keydown, keyup, keypress
  true, // bubbles
  true, // cancelable
  window, // view: should be window
  false, // ctrlKey
  false, // altKey
  false, // shiftKey
  false, // metaKey
  'A', // keyCode: unsigned long - the virtual key code, else 0
  0, // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
);

const inputBox = document.querySelector("#editArea");

// **** The following method is also useless:
inputBox.addEventListener("YKY", function(){
	inputBox.dispatchEvent(keyboardEvent);
	console.log("Injection invoked");
});

console.log("Injection loaded");
