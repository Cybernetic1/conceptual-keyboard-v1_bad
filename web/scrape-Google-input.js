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

var initials = [
'b', //巴
'p', //怕
'm', //媽
'f', //花
'd', //打
't', //他
'n', //那
'l', //啦
'g', //家
'k', //卡
'ng', //牙
'h', //蝦
'gw', //瓜
'kw', //誇
'w', //蛙
'j', //渣
'ch', //叉
's', //沙
'y' //也
];

var finals = [
'a', //把
'ai', //閉
'aai', //擺
'au', //售
'aau', //稍
'am', //心
'aam', //三
'an', //新
'aan', //山
'ang', //萌
'aang', //猛
'ap', //粒
'aap', //立
'at', //甩
'aat', //辣
'ak', //北
'aak', //白
'e', //捨
'ei', //死
'eng', //腥
'ek', //錫
'i', //思
'iu', //小
'im', //閃
'in', //先
'ing', //升
'ip', //攝
'it', //洩
'ik', //式
'oh', //哥
'oi', //改
'o', //高
'on', //趕
'ong', //江
'ot', //割
'ok', //各
'oo', //估
'ooi', //背
'oon', //半
'oot', //撥
'ui', //雖
'un', //鈍
'ung', //動
'ut', //率
'uk', //縮
'euh', //靴
'eung', //香
'euk', //削
'ue', //輸
'uen', //宣
'uet', //說
'm', //唔
'ng' //五
];

function* pins() {
  for (var i in initials)
	for (var f in finals)
		yield (initials[i] + finals[f]).split('').join(' ');
}

const iterator = pins();

var count = 0;

function getScrape(resp) {

	setTimeout(function() {

		// *** Every time it gets to here, there has been a 600 ms delay

		iframe = document.getElementsByTagName("iframe")[2];
		// stuff = document.getElementsByClassName("ita-ppe-box")[0].childNodes[1].innerText;
		stuff = iframe.contentDocument.children[0].childNodes[1].innerText;

		++count;
		var s = ('00' + count.toString()).slice(-2);
		stuff = s + " " + stuff;
		document.getElementById("ScrapedStuff" + s).innerHTML = stuff;

		console.log($.ajax({
			method: "POST",
			url: "/appendFile/",
			data: stuff,
			success: function(resp) {}
		}));

		if (count < 20) {
			// sent down-arrow key
			console.log($.ajax({
				method: "POST",
				url: "/keystrokes/",
				data: "Page_Down",
				success: getScrape
			}));
		}
		else
			newPinyin();

	}, 600);
}

function newPinyin() {

	count = 0;

	console.log($.ajax({
		method: "POST",
		url: "/keystrokes/",
		data: iterator.next().value,
		success: getScrape
	}));
}

setTimeout(newPinyin, 1000);
