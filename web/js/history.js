// History of input box
const MaxHistory = 1000;
var history = new Array(MaxHistory);
var history_index = 0;			// current position of history, should be empty
var history_view_index = -1;	// current viewing position of history

// **** record in history
function recordHistory(str) {
	history[history_index] = str;
	++history_index;
	if (history_index == MaxHistory)
		history_index = 0;
	history_view_index = -1;
}

// Browsing history with up and down arrows
document.onkeydown = checkKey;

function checkKey(e) {
	e = e || window.event;

	if (e.keyCode == 38) {							// up arrow key
		// console.log("up arrow detected");
		if (history_view_index <= 0) {				// -1 = no history to view
			var stuffs = white_box.value;
			if (stuffs)
				recordHistory(stuffs);
			history_view_index = history_index - 1;
			}
		else
			--history_view_index;
		white_box.value = history[history_view_index];
		}
	if (e.keyCode == 40) {							// down arrow key
		// console.log("down arrow detected");
		if (history_view_index != -1)				// -1 = no history to view
			{
			++history_view_index;
			if (history_view_index == history_index)	// reached end of history?
				{
				history_view_index = -1;
				white_box.value = "";
				}
			else
				white_box.value = history[history_view_index];
			}
		}
	// white_box.focus();
	};
