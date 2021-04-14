# -*- coding: UTF-8 -*-

# Input: list with char + ... whatever
# Output: first char of each line is simplified Chinese, where possible

import sys

f0 = open("web/hcutf8-YKY.txt", "r")
# format: "繁简\n"

dict = {}
for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	if line[0] == '>':			# unidirectional change (typical example: 麵面)
		ch = line[1]
		ch2 = line[2]
	elif line[0] == '-':		# YKY prefers no change in usual usage (eg 迴回)
		continue
	else:
		ch = line[0]
		ch2 = line[1]

	if ch in dict:
		print(i + 1, ch, "in dict!", line)
	if ch == ch2:
		print(i + 1, "duplicate!", line)
	
	dict[ch] = ch2
f0.close()

f1 = open("web/YKY-custom-pinyins.txt", "r")
#f1 = open("web/char-rel-freq.txt", "r")
# format: "字pinyin\n"

fo = open("web/YKY-custom-pinyins-ZH.txt", "w")
#fo = open("web/char-rel-freq-ZH.txt", "w")

for line in f1:
	c = line[0]
	if c in dict:
		c = dict[c]
	fo.write(c + line[1:])		# '\n' included

f1.close()
fo.close()
