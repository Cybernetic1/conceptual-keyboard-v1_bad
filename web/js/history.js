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
