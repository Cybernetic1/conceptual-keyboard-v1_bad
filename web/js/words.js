// To do (sorted by priority)
// ==========================

// To do -- phrases
// ================
// * Output matching words for char list members 1,2,3,...
// * With Neo4j:
//		- later, words can be semantically clustered
// * each phrase is addressed by 1 or more key?
//		It may be too slow to search from zero
// * but it may be the job of an RNN -- output a few keys
// * OR, cluster phrases, map chars --> semantic clusters
// * OR, build semantically-organized tree structure
// * Google Input Method has some "consonent abbreviation" for phrases
// *

// Done:
// =====
// * use Neo4j to store words
// * With Neo4j:
//		- store all chars and all words (n-grams) as nodes
//		- store "char belongs to word" relations
// * findWords_char() use simplified chars
// * findWord regex buggy
// * display 常用词语, eg "词语"
//		- decompose pinyin into 2 chars (could have multiple possibilities)
//		- how to find all matching 2-words?  actually can use Neo4j.

// This web driver allows to talk to Neo4j via web socket
var driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'l0wsecurity') );

var main_list = [];

async function findWords_pinyins(p1, p2) {
	const session = driver.session();

	try {
		const result = await session.run(
			"MATCH (p1:Pinyin {pinyin: $p1}) -[:P2C]-> (c1:Char) -[:In]-> (w) <-[:In]- (c2:Char) <-[:P2C]- (p2:Pinyin {pinyin: $p2}) RETURN (w)",
			{p1 : p1, p2 : p2} );
		console.log("match pinyins:", p1, p2, result.records.length);
		new_list = [];
		result.records.forEach(function(r) {
			const node = r.get(0);
			const word = node.properties.chars;
			new_list.push(word);
			});

		add_to_list(new_list);
		} finally {
		await session.close()
		}
	}

async function findWords_char(ch) {
	const session = driver.session();

	const char = simplify_char(ch);
	try {
		const result = await session.run(
			"MATCH (c:Char {char: $char}) -[:In]-> (w) RETURN (w)",
			{char: char} );
		console.log("match char:", char, result.records.length);
		new_list = [];
		result.records.forEach(function(r) {
			const node = r.get(0);
			const word = node.properties.chars;
			new_list.push(word);
			});

		add_to_list(new_list);
		} finally {
		await session.close()
		}
	}

function add_to_list(new_list) {
	// **** each time, truncate the previous list to 400
	if (main_list.length > 400)
		main_list = main_list.slice(0, 400);

	// **** merge the 2 lists and sort them
	var new_list2 = new_list.map(x => [x, freq0(x)] );
	// 'amortization' of main_list elements:
	main_list = main_list.map(z => [z[0], z[1] / 2.0]);
	let results = [...main_list, ...new_list2];
	main_list = results.sort((a, b) => a[1] > b[1] ? -1 : 1 );

	regenerate_list();
	}

function regenerate_list() {
	upperLevels.innerHTML = "";		// clear the contents first

	main_list.forEach(function(z, i) {
		var num = i.toString() + ' ';
		textNode = document.createElement('span');
		textNode.appendChild(document.createTextNode(num + z[0]));
		textNode.number = i;
		if (z[0].length > 1)
			textNode.className = "W";
		else
			textNode.className = "C";
		upperLevels.appendChild(textNode);
		textNode.onclick = charword_SingleClick;
		});
	}

// Event handler for single-click of a suggested word
function charword_SingleClick(ev) {
	var i = this.number;

	const audio = new Audio("sending.ogg");
	audio.play();

	sendWord(i);
	}

// **** decompose pinyin into 2 (or more, to be implemented later) words
// Assume that the pinyin is correct and can be decomposed
// ie, pinyin = k1 n1 k2 n2
// problem is: both k, n can be null, and there may exist multiple matches
// How about using regular expressions?
function decompose_pinyin(s) {
	// regex = ( (?:k) (?:n) ){2}
	let regex = /((?:b|ch|d|f|gw|gy|g|hm|h|j|kw|k|l|m|ng|n|p|s|ty|t|w|y|)(?:aai|aak|aam|aan|aang|aap|aat|aau|ai|ak|am|ang|an|ao|ap|at|au|a|ei|ek|eng|eung|eun|eui|euk|eut|eu|e|ik|im|ing|in|ip|it|iu|i|oi|ok|ong|on|ot|ou|o|uen|ud|ue|ui|uk|ung|un|ut|u|yun|yut|yu))/g;

	const results = [...s.matchAll(regex)];
	// const results = s.match(regex);
	return results;
}
