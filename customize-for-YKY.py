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
	"yeuk" : ["yue, yerk", "yeuk"],

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
	"seut" : ["shut, shue"],

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

dict = {}

import codecs

# open input file
f1 = codecs.open("web/exact-Google-pinyins.txt", encoding="UTF-8", "r")

for line in f1:
	c = ord(line[1])
	if c > 255:				# ignore phrases
		continue

	print ("\033[0;35m", line, "\033[0m")
	char = line[0]
	pinyin = line[1:]

f1.close()

print(dict)

# output file
fo = codecs.open("YKY-custom-pinyins.txt", encoding="UTF-8", mode='w')

for p1 in dict:
	for p2 in dict[p1]:
		f2.write(p1 + "," + p2 + '\n')

f2.close()
