#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Input: list with char + pinyin
# Output: list of unique pinyins

import sys
import numpy as np

f1 = open("distinct-sounds-2.txt", "r")
# format: "字,consonant,final"
fo = open("syllables.html", "w")

ks = set()
ns = set()

for line in f1:
	items = line.split(',')
	k = items[1]
	if k == '?\n':
		continue
	n = items[2][:-1]
	ks.add(k)
	ns.add(n)

print("table size = ", len(ns), "x", len(ks))
table = np.zeros( (len(ns), len(ks)) , dtype=object)

nz = sorted(ns)
# for k's, put '?y' towards the end
kz = sorted(ks, key=lambda k: '' if k == '' else \
	k[0] if len(k) == 1 else \
	(('z' + k[0]) if k[1] == 'y' else k) )

f1.seek(0)

for line in f1:
	items = line.split(',')
	c = items[0]
	k = items[1]
	if k == '?\n':
		continue
	n = items[2][:-1]
	j = kz.index(k)
	i = nz.index(n)
	if table[i, j] == 0:
		table[i, j] = c
	else:
		table[i, j] += c

# with np.printoptions(edgeitems=100):
#	print(table)

# **** output HTML code:
fo.write("<html><body><table border=1 align=center><tr><th></th>")
for j in range(len(kz)):
	fo.write("<th><font color=red>%s</font></th>" % kz[j])
fo.write("</tr>")

for i in range(len(nz)):
	fo.write("<tr><th><font color=green>%s</font></th>" % nz[i])
	for j in range(len(kz)):
		if table[i,j] != 0:
			fo.write("<td>%s</td>" % table[i,j][0])	# [0]
		else:
			fo.write("<td></td>")
	fo.write("<th><font color=green>%s</font></th></tr>" % nz[i])
	if i == len(nz) // 2:
		fo.write("<tr><th></th>")
		for j in range(len(kz)):
			fo.write("<th><font color=red>%s</font></th>" % kz[j])
		fo.write("</tr>")
		
fo.write("<tr><th></th>")
for j in range(len(kz)):
	fo.write("<th><font color=red>%s</font></th>" % kz[j])
fo.write("</tr></table></body></html>")

fo.close()
