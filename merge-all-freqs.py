# -*- coding: UTF-8 -*-

# CorpusWordlist + CorpusWordPOSlist --> merged-freqs.txt
# size = 8643287 (words) + 8989573 (words)
size1 = 8643287 + 8989573

# CUHK-rel-freqs + WHK-rel-freqs --> char-rel-freq.txt
# size = 11825308 (chars) + 2943956 (chars)
size2 = 11825308 + 2943956

# Combine chinese-words.txt & 
# output: words of length at least > 1

import sys
import re

dict = {}

f0 = open("web/merged-freqs.txt", "r")
# format: "字字... (space) freq \n"

for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(' ')

	w = items[0]
	if len(w) == 1:
		dict[w] = float(items[1])		# note items[1] has '\n'
f0.close()

f0 = open("web/char-rel-freq.txt", "r")
# format: "字 , freq \n"	 with no possibility of > 1 chars

j = 0
for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')

	c = items[0]
	freq = float(items[1])				# note items[1] has '\n'
	if c in dict:
		j += 1
		dict[c] = (dict[c] * size1 + freq * size2 ) / (size1 + size2)
	else:
		dict[c] = freq
f0.close()

print(len(dict), "unique chars")
print(j, "common chars found")

fo = open("web/all-freqs.txt", "w")
for c in sorted(dict, key=dict.get, reverse=True):
	fo.write(c + str(dict[c]) + '\n')
fo.close()
