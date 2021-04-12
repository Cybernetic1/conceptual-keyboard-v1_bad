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
	if line[0] == '>':			# unidirectional change
		line = line[1:]
	elif line[0] == '-':		# necessary change
		line = line[1:]

	if line[0] in dict:
		print(i + 1, line[0], "in dict!", line)
	if line[0] == line[1]:
		print(i + 1, "duplicate!", line)
	dict[line[0]] = line[1]
f0.close()

f1 = open("web/YKY-custom-pinyins.txt", "r")
# format: "字pinyin\n"

fo = open("web/YKY-custom-pinyins-ZH.txt", "w")

for line in f1:
	c = line[0]
	if c in dict:
		c = dict[c]
	fo.write(c + line[1:])		# '\n' included

f1.close()
fo.close()
