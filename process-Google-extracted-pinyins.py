#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Extract exacts pinyins of chars
# Output text file of pinyins

# Format of input file:
# =====================
# 01 pinyin 1.char (pinyin) 2.char (pinyin) .... 6.char (pinyin)
# Much of this info can be ignored.  We just need the chars and the pinyins.

import codecs
import re

# output file
f2 = codecs.open("exact-Google-pinyins.txt", encoding="UTF-8", mode='w')

dict = {}

pattern = re.compile('[0-9]\. (\w+) \(([^\)]*)\)')

for i in ["1", "2", "3"]:

	# open input file
	f = codecs.open("web/scraped-Google-" + i + ".txt", encoding="UTF-8", mode='r')

	for line in f:

		print ("\033[0;34m", line, "\033[0m")
		# * The following fails because only the last item in a ()+ pattern is captured:
		# pinyins = re.match('[0-9][0-9] [a-z]+ (([0-9]\.(\w+) \(([^\)]*)\)[ |\n])+)', line)
		pinyins = pattern.findall(line)
		# print(pinyins)

		# **** Add pinyin to memory:
		for p in pinyins:
			print(p[0], p[1])
			if not p[0] in dict:
				dict.setdefault(p[0], [])		# each dict's value is a list
				dict[p[0]].append(p[1])
			elif p[1] in dict[p[0]]:
				pass
			else:
				dict[p[0]].append(p[1])
				# **** multiple pinyins:
				# print(p[0], p[1], end='')
				# print("\033[0;31m Error: ", end='')
				# print(dict[p[0]], "\033[0m")

	f.close()

# print(dict)

# **** Output char list sorted by freq:
for char in dict:
	for pinyin in dict[char]:
		f2.write(char + pinyin + '\n')

f2.close()
