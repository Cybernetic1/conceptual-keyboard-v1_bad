# -*- coding: UTF-8 -*-

import sys

f0 = open("web/CorpusWordlist.csv", "r")
# id,词语,出现次数,频率（%）,累积频率（%）
# 1,的,744863,7.7946,7.7946

s = 0
for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')
	s += int(items[2])
f0.close()

print("sum1 =", s)

f0 = open("web/CorpusWordPOSlist.csv", "r")
# id,词语,词类标记,词类名称,出现次数,频率,累积频率
# 1,的,u,助词,744863,7.7946,7.7946

s = 0
for i, line in enumerate(f0):
	if line[0] == '/':
		continue
	items = line.split(',')
	s += int(items[4])
f0.close()

print("sum2 =", s)
