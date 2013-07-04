#!/usr/bin/python
# -*- coding: GB18030 -*-

# Categories have 3 levels, such as "Aa01"
# Below this level could be 10-20 lines of words

import codecs
import os

# open input file
# Note: this should be the full text file of "Synonym Forest", change if needed
f1 = codecs.open("detailed_table_of_contents.txt", encoding="GB18030", mode='r')
f2 = codecs.open("synonym_forest_full_2005.3.3.txt", encoding="GB18030", mode='r')

# output file
fo = codecs.open("synonym_forest_YKY_database.txt", encoding="GB18030", mode='w')

# for example:  the first label is "Aa01A01"

# next_word = None
next_line = None
counter = 0

for line1 in f1:

	if line1[0] != '\t':
		# print level-1 heading, eg: 1. Heading
		fo.write("\t" + str(ord(line1[0]) - ord('A') + 1) + ". " + line1[2:])
		counter = 0
	elif line1[1] != '\t':
		# print level-2 heading, eg: 1.1. Heading
		fo.write("\t" + str(ord(line1[1]) - ord('A') + 1) + ".")
		fo.write(str(ord(line1[2]) - ord('a') + 1) + ". " + line1[4:])
		counter = 0
	else:
		# print level-3 heading, eg: 1.1.01. Heading
		fo.write("\t" + str(ord(line1[2]) - ord('A') + 1) + ".")
		fo.write(str(ord(line1[3]) - ord('a') + 1) + ".")
		# This number is ignored because they are sometimes not contagious
		# fo.write(line1[4:6] + ". " + line1[8:])
		# Instead, we count our own index:
		counter = counter + 1
		fo.write(str(counter) + ". " + line1[8:])

		label1 = line1[2:6]			# 4-character label consisting of first 3 levels

		if next_line:
			fo.write(next_line)
			next_line = None

		# now we need to print all f2 entries subsumed by label1
		while True:
			line2 = f2.readline()
			label2 = line2[0:4]		# 4-character label, same format as label1
			
			# first_word = line2[9:-2].split(' ')[0]

			if label1 != label2:
				# next_word = first_word
				next_line = line2[9:]
				break

			fo.write(line2[9:])
			
fo.close()
exit()
