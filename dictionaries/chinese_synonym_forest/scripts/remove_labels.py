#!/usr/bin/python
# -*- coding: GB18030 -*-

# Merge the brief table of contents with extracted categories
# Outputs the detailed table of contents

import codecs

# read input file
f1 = codecs.open("detailed_table_of_contents.txt", encoding="GB18030", mode='r')

# output file
fout = codecs.open("synonym_forest_categories_no_labels.txt", encoding="GB18030", mode='w')

for line in f1:

	if line == "\n":										# skip blank lines
		continue

	if line[0] != '\t':
		fout.write(line[2:])
	elif line[1] != '\t':
		fout.write("\t" + line[4:])
	else:
		fout.write("\t\t" + line[8:])

fout.close()
