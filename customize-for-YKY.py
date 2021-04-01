# -*- coding: UTF-8 -*-

# modify "exact-Google-pinyins.txt" to YKY's custom pinyins

# Format of input file:
# =====================
# "字pinyin" or "字字pinyin"

# Output file same format.

replace_finals = {
	"aai" : ["ai","aai"],
	"aak" : ["ak","aak"],
	"aam" : ["am","aam"],
	"aan" : ["an","aan"],
	"aang" : ["ang","aang"],
	"aap" : ["ap","aap"],
	"aat" : ["at","aat"],
	"aau" : ["au","aau"],

	"ou" : ["o","ou"],
	"ou" : ["ol","ou"],
}

replace_entire = {
	"nei" : ["ni", "nei"],

	"deu" : ["der","deu"],
	"geu" : ["gur","geu"],
	"heu" : ["her","heu"],
	"teu" : ["ter","teu"],

	"cheui" : ["chui"],
	"deui" : ["due"],
	"geui" : ["gue"],
	"heui" : ["hue"],
	"jeui" : ["jui"],
	"keui" : ["kue"],
	"leui" : ["lui"],
	"neui" : ["nui"],
	"seui" : ["sui"],
	"teui" : ["tue"],
	"yeui" : ["yue"],

	"cheuk" : ["cherk","cheuk"],
	"deuk" : ["derk","deuk"],
	"geuk" : ["gue","geuk"],
	"jeuk" : ["juk","jeuk"],
	"keuk" : ["kue","keuk"],
	"leuk" : ["lue","leuk"],
	"seuk" : ["shue","seuk"],
	"yeuk" : ["yue", "yerk", "yeuk"],

	"cheun" : ["chun","cheun"],
	"deun" : ["dun","deun"],
	"jeun" : ["jun","jeun"],
	"leun" : ["lun","leun"],
	"seun" : ["shun","seun"],
	"teun" : ["tun","teun"],
	"yeun" : ["yun","yeun"],

	"cheut" : ["chut"],
	"deut" : ["due"],
	"jeut" : ["jue"],
	"leut" : ["lud"],
	"seut" : ["shut", "shue"],

	"chyu" : ["chu"],
	"chyun" : ["chuen"],
	"chyut" : ["chut"],

	"dyut" : ["due"],
	"dyun" : ["duen"],
	"gyut" : ["gue"],
	"hyut" : ["hue"],
	"hyun" : ["huen"],
	"jyut" : ["chut"],
	"jyun" : ["juen"],
	"jyu" : ["juk"],
	"kyut" : ["kue"],
	"kyun" : ["kuen"],
	"lyut" : ["lue"],
	"lyun" : ["luen"],
	"nyun" : ["luen"],
	"syut" : ["shue"],
	"syun" : ["suen"],
	"syu" : ["shu"],
	"tyut" : ["tue"],
}

consonants = ['b','ch','d','dy','f','g','gw','gy','h','hm','hy','j','jy','k','kw','ky','l','ly','m','n','ng','ny','p','s','sy','t','ty','w','y']

vowels = ['a','aai','aak','aam','aan','aang','aap','aat','aau','ai','ak','am','an','ang','ap','at','au','e','ei','ek','eng','eu','eui','euk','eun','eung','eut','i','ik','im','in','ing','ip','it','iu','o','oi','ok','on','ong','ot','ou','u','ui','uk','un','ung','ut','yu','yun','yut']

def k_n(pinyin):
	c = pinyin[0]
	cc = pinyin[0:2]
	k = ""
	n = ""
	if cc in consonants:
		k = cc
		n = pinyin[2:]
	elif c in consonants:
		k = c
		n = pinyin[1:]
	else:
		n = pinyin
	return (k, n)

import codecs

# open input file
f1 = codecs.open("web/exact-Google-pinyins.txt", encoding="UTF-8", mode="r")

# output file
fo = codecs.open("web/YKY-custom-pinyins.txt", encoding="UTF-8", mode='w')

for line in f1:
	c = ord(line[1])
	if c > 255:				# ignore phrases
		continue

	print (line[:-1], end=' ')
	char = line[0]
	pinyin = line[1:-1]

	if pinyin in replace_entire:
		for r in replace_entire[pinyin]:
			fo.write(char + r + '\n')
		continue

	(k, n) = k_n(pinyin)
	if n in replace_finals:
		for r in replace_finals[n]:
			fo.write(char + k + r + '\n')
		continue

	fo.write(char + pinyin + '\n')

f1.close()
fo.close()
