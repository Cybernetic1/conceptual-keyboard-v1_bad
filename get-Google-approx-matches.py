#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Extract Google's approx matching of pinyins
# Output text file of approx pinyin pairs

# Format of input file:
# =====================
# 01 pinyin 1.字 (pinyin) 2.字 (pinyin) .... 6.字 (pinyin)
# Approx matching pairs = left-hand-side pinyin is different from the (pinyins) in parentheses

# TO-DO:
# * extract consonents and vowels matchings separately

# DONE:
# * combined Cantonese frequencies, including 咁 etc

import codecs
import re

# output file
f2 = codecs.open("Google-approx-matchings.txt", encoding="UTF-8", mode='w')

dict = {}

pattern = re.compile('[0-9]\. (\w+) \(([^\)]*)\)')

for i in ["1"]:

	# open input file
	f = codecs.open("web/scraped-Google-" + i + ".txt", encoding="UTF-8", mode='r')

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
