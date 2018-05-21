// What is our map?
//     pinyin sequence --> char(s) sorted by frequency
// We already have most chars --> their pinyins using Yale standard
// But we lack pinyin --> chars using Google approx standard
// the latter mappings could be added 'as-is' to existing map
// or, we could have an additional "approx" map: pinyin --> pinyin
// The latter map would be useful if the "correct" pinyin is missing
// So it gets to the question:  what is the "correct" pinyin?
// Perhaps we just add everything to the big map?
// And perhaps also change the Yale pinyins that I don't like...

// ** The key point is that 我保留整个 mapping 的制作流程, so the mapping can be refined later **

// Another problem is:  if I say pinyin1 = pinyin2, then all the 同音字 will also change accordingly.
// Perhaps we need to cluster all the 同音字s first?
// 或者更确切地说，这是个 set-to-set mapping.
// Or, we need to find the "primary" mapping first.
// That means, find the list of unique pronunciations

// ************************************************
// call server --> shell escape --> send keystrokes

var count = 0;

function getScrape(resp) {

	setTimeout(function() {

		// *** Every time it gets to here, there has been a 600 ms delay

		iframe = document.getElementsByTagName("iframe")[2];
		// stuff = document.getElementsByClassName("ita-ppe-box")[0].childNodes[1].innerText;
		stuff =iframe.contentDocument.children[0].childNodes[1].innerText;

		++count;
		var s = ('00' + count.toString()).slice(-2);
		document.getElementById("ScrapedStuff" + s).innerHTML = s + " " + stuff;

		if (count < 10) {
			// sent down-arrow key
			console.log($.ajax({
				method: "POST",
				url: "/keystrokes/",
				data: "Page_Down",
				success: getScrape
			}));
		}

	}, 600);
}

setTimeout(function() {
	var keys = "n g o";

	console.log($.ajax({
		method: "POST",
		url: "/keystrokes/",
		data: keys,
		success: getScrape
	}));
}, 1000);

