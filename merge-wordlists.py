# -*- coding: UTF-8 -*-

import sys

f0 = open("web/CorpusWordlist.csv", "r")
# id,词语,出现次数,频率（%）,累积频率（%）
# 1,的,744863,7.7946,7.7946

dict = {}

for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')
	if items[1] in dict:
		print(i + 1, items[1], "in dict!", line)
	dict[items[1]] = float(items[3])
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
	if items[1] in dict:
		j += 1
		dict[items[1]] = (dict[items[1]] * size1 + float(items[5]) * size2 ) / (size1 + size2)
	else:
		dict[items[1]] = float(items[5])
f0.close()

print(j, "common chars/words merged")

f1 = open("web/merged-freqs.txt", "w")
for w in sorted(dict, key=dict.get, reverse=True):
	f1.write(w + ' ' + str(dict[w]) + '\n')
f1.close()
