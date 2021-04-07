# -*- coding: UTF-8 -*-

# modify "exact-Google-pinyins.txt" to YKY's custom pinyins

# Format of input file:
# =====================
# "字pinyin" or "字字pinyin"

# Output file same format.

# **** Old consonants & vowels from Google pinyin ****

consonants = ['b','ch','d','dy','f','g','gw','gy','h','hm','hy','j','jy','k','kw','ky','l','ly','m','n','ng','ny','p','s','sy','t','ty','w','y']

vowels = ['a','aai','aak','aam','aan','aang','aap','aat','aau','ai','ak','am','an','ang','ap','at','au','e','ei','ek','eng','eu','eui','euk','eun','eung','eut','i','ik','im','in','ing','ip','it','iu','o','oi','ok','on','ong','ot','ou','u','ui','uk','un','ung','ut','yu','yun','yut']

# new consonants = ['b','ch','d','f','g','gw','gy','h','hm','j','k','kw','l','m','n','ng','p','s','t','ty','w','y']

# new vowels = ['a','aai','aak','aam','aan','aang','aap','aat','aau','ai','ak','am','an','ang','ao','ap','at','au','e','ei','ek','eng','er','erk','eu','eui','euk','eun','eung','eut','i','ik','im','in','ing','ip','it','iu','o','oi','ok','ol''on','ong','ot','ou','u','ud','ue','uen','ui','uk','un','ung','ur','ut','yu','yun','yut']

replace_consonants = {
	"n" : ["n", "l"],
}

replace_finals = {
	"aai" : ["ai","aai"],
	"aak" : ["ak","aak"],
	"aam" : ["am","aam"],
	"aan" : ["an","aan"],
	"aang" : ["ang","aang"],
	"aap" : ["ap","aap"],
	"aat" : ["at","aat"],
	"aau" : ["au","aau"],

	"ou" : ["o","ol", "ou"],
	"at" : ["at", "ud"],
	"au" : ["au", "ao"],
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
	"jyu" : ["juk", "ju", "chu" ],
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

# Note: if a consonant is 2-chars, it must be recognized first
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
fo = codecs.open("web/YKY-custom-pinyins-tmp.txt", encoding="UTF-8", mode='w')

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

	fo.write(char + pinyin + '\n')

f1.close()
fo.close()

print("**** Phase 2 ****")

f1 = codecs.open("web/YKY-custom-pinyins-tmp.txt", encoding="UTF-8", mode="r")
fo = codecs.open("web/YKY-custom-pinyins.txt", encoding="UTF-8", mode='w')

for line in f1:
	print (line[:-1], end=' ')
	char = line[0]
	pinyin = line[1:-1]

	(k, n) = k_n(pinyin)
	
	if k in replace_consonants:
		for k2 in replace_consonants[k]:
			if n in replace_finals:
				for n2 in replace_finals[n]:
					fo.write(char + k2 + n2 + '\n')
			else:
					fo.write(char + k2 + n + '\n')
		continue
	elif n in replace_finals:
		for n2 in replace_finals[n]:
			fo.write(char + k + n2 + '\n')
		continue

	fo.write(char + pinyin + '\n')

f1.close()
fo.close()
