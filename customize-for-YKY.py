# -*- coding: UTF-8 -*-

# modify "exact-Google-pinyins.txt" to YKY's custom pinyins

# Format of input file:
# =====================
# "字pinyin" or "字字pinyin"

import codecs

# open input file
f1 = codecs.open("web/exact-Google-pinyins.txt", encoding="UTF-8", "r")

# output file
fo = codecs.open("YKY-custom-pinyins.txt", encoding="UTF-8", mode='w')

replace_finals = {
	"aai" : "ai",
	"aak" : "ak",
	"aam" : "am",
	"aan" : "an",
	"aang" : "ang",
	"aap" : "ap",
	"aat" : "at",
	"aau" : "au",

	# require more thoughts:
	"eu" : "er",
	"eui" : "ui",
	"euk" : "erk",
	"ou" : "ol"
}

replace_entire = {
	"chyu" : "chu",
	"chyun" : "chuen",
	"chyut" : "chut",

	"dyut" : "due",
	"dyun" : "duen",
	"gyut" : "gue",
	"hyut" : "hue",
	"hyun" : "huen",
	"jyut" : "chut",
	"jyun" : "juen",
	"jyu" : "juk",
	"kyut" : "kue",
	"kyun" : "kuen",
	"lyut" : "lue",
	"lyun" : "luen",
	"nyun" : "luen",
	"syut" : "shue",
	"syun" : "suen",
	"syu" : "shu",
	"tyut" : "tue"
}

dict = {}

for line in f:

	print ("\033[0;35m", line, "\033[0m")
	# * The following fails because only the last item in a ()+ pattern is captured:
	# pinyins = re.match('[0-9][0-9] [a-z]+ (([0-9]\.(\w+) \(([^\)]*)\)[ |\n])+)', line)
	head = re.match('[0-9][0-9] ([a-z]+) [0-9]\..*', line).group(1)
	pinyins = pattern.findall(line)
	print(head)
	# print(pinyins)

	# **** Check if head is different from (tails), if so, record pair
	for p in pinyins:
		print(p[1])
		if head == p[1]:					# head = tail, ignore
			continue
		if len(p[0]) == 2:					# ignore phrases
			continue
		if not head in dict:
			dict.setdefault(head, [])		# each dict's value is a list
			dict[head].append(p[1])
		elif p[1] in dict[head]:
			pass
		else:
			dict[head].append(p[1])
			# **** multiple pinyins:
			# print(head, p[1], end='')
			# print("\033[0;31m Error: ", end='')
			# print(dict[head], "\033[0m")

f.close()

print(dict)

# **** Output char list sorted by freq:
for p1 in dict:
	for p2 in dict[p1]:
		f2.write(p1 + "," + p2 + '\n')

f2.close()
