# -*- coding: UTF-8 -*-

# Combine chinese-words.txt & CorpusWordlist & CorpusWordPOSlist
# output: words of length at least > 1

import sys
import re

uniques = set()

f0 = open("web/CorpusWordlist.csv", "r")
# id,词语,出现次数,频率（%）,累积频率（%）
# 1,的,744863,7.7946,7.7946

for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')

	w = items[1]
	if len(w) > 1:
		uniques.add(w)
f0.close()

f0 = open("web/CorpusWordPOSlist.csv", "r")
# id,词语,词类标记,词类名称,出现次数,频率,累积频率
# 1,的,u,助词,744863,7.7946,7.7946

size1 = 8643287
size2 = 8989573

j = 0
for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')

	w = items[1]
	if len(w) > 1:
		if w in uniques:
			j += 1
		else:
			uniques.add(w)
f0.close()

print(j, "common words found")

f0 = open("web/chinese-words.txt", "r")

j = 0
for i, line in enumerate(f0):
	words = re.split('\n|\t', line)
	# These are all words with length > 1 strictly
	for w in words:
		if w == '':
			continue
		if len(w) == 1:
			print ("char found!", i, line)
			continue
		if w in uniques:
			j += 1
		else:
			uniques.add(w)
f0.close()

print(j, "common words found")

f1 = open("web/all-words.txt", "w")
for w in uniques:
	f1.write(w + '\n')
f1.close()
