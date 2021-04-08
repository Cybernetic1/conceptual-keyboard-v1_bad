// To do (sorted by priority)
// ==========================
// * findWord regex buggy 
// * display 常用词语, eg "词语"
//		- decompose pinyin into 2 chars (could have multiple possibilities)
//		- how to find all matching 2-words?  actually can use Neo4j.

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


// This web driver allows to talk to Neo4j via web socket
var driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'l0wsecurity') );

async function findWords_pinyins(p1, p2) {
	const session = driver.session();

	try {
		const result = await session.run(
			"MATCH (p1:Pinyin {pinyin: $p1}) -[:P2C]-> (c1:Char) -[:In]-> (w) <-[:In]- (c2:Char) <-[:P2C]- (p2:Pinyin {pinyin: $p2}) RETURN (w)",
			{p1 : p1, p2 : p2} );
		console.log(result.records.length);
		var words = new Array();
		result.records.forEach(function(r) {
			const node = r.get(0);
			const word = node.properties.chars;
			words.push(word);
			});

		// default Javascript sort order = 1,2,3...
		words.sort(function(a, b) {
			if (a.length > b.length)
				return 1;
			else if (a.length < b.length)
				return -1;
			else if (a[0] in cs)
				return -1;
			else if (b[0] in cs)
				return 1;
			else
				return 0;
			});

		columnB.innerHTML = "";		// clear the contents first
		words.forEach(function(w, i) {
			var num = i.toString() + ' ';
			textNode = document.createElement('span');
			textNode.appendChild(document.createTextNode(num + w));
			columnB.appendChild(textNode);
			// console.log(node.properties.chars);
			});

		// **** on-click HTML "span" element:
		$("#columnB span").on('click', function(ev)
			{
			clicked_str = this.textContent;
			var spanItem = this;
			word_SingleClick(spanItem);
			})
			.dblclick(function(ev)
				{
				word_DoubleClick();
				});

		} finally {
		await session.close()
		}
	}

async function findWords_char(ch) {
	const session = driver.session();

	const c = simplify_char(ch);
	try {
		const result = await session.run(
			"MATCH (n:Char {char: $char}) -[:In]-> (m) RETURN (n),(m)",
			{char: c} );
		console.log(result.records.length);

		columnB.innerHTML = "";		// clear the contents first
		result.records.reverse().forEach(function(r, i) {
			const node = r.get(1);
			const word = node.properties.chars;

			var num = i.toString() + ' ';
			textNode = document.createElement('span');
			textNode.appendChild(document.createTextNode(num + word));
			columnB.appendChild(textNode);

			// console.log(node.properties.chars);
			});

		// **** on-click HTML "span" element:
		$("#columnB span").on('click', function(ev)
			{
			clicked_str = this.textContent;
			var spanItem = this;
			word_SingleClick(spanItem);
			})
			.dblclick(function(ev)
				{
				word_DoubleClick();
				});

		} finally {
		await session.close()
		}
	}

// Event handler for single-click of a suggested word
function word_SingleClick(item) {
	const selection = clicked_str;			// the clicked word (string)

	const audio = new Audio("sending.ogg");
	audio.play();

	add_to_caret(selection.split(' ')[1]);
	}

function word_DoubleClick() {				// display number, just for testing
	const selection = clicked_str;			// the clicked word (string)

	pair = selection.split(' ');			// number, word
	add_to_caret(pair[0], remove=pair[1].length);
	}

// **** decompose pinyin into 2 (or more, to be implemented later) words
// Assume that the pinyin is correct and can be decomposed
// ie, pinyin = k1 n1 k2 n2
// problem is: both k, n can be null, and there may exist multiple matches
// How about using regular expressions?
function decompose_pinyin(s) {
	// regex = ( (?:k) (?:n) ){2}
	let regex = /((?:b|ch|d|f|g|gw|gy|h|hm|j|k|kw|l|m|n|ng|p|s|t|ty|w|y)(?:aai|aak|aam|aan|aang|aap|aat|aau|ai|ak|am|an|ang|ap|at|au|a|e|ei|ek|eng|eu|eui|euk|eun|eung|eut|ik|im|ing|in|ip|it|iu|i|o|oi|ok|on|ong|ot|ou|ui|uk|ung|un|ut|u|yu|yun|yut))/g;

	const results = [...s.matchAll(regex)];
	// const results = s.match(regex);
	return results;
}
