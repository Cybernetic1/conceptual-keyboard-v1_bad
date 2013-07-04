#!/usr/bin/python
# -*- coding: GB18030 -*-

# Merge the brief table of contents with extracted categories
# Outputs the detailed table of contents

import codecs

# read input file
f1 = codecs.open("brief_table_of_contents.txt", encoding="GB18030", mode='r')
f2 = codecs.open("synonym_forest_categories.txt", encoding="GB18030", mode='r')

# output file
fout = codecs.open("detailed_table_of_contents.txt", encoding="GB18030", mode='w')

current_label = "Zz"

for line2 in f2:

	if line2 == "\n":										# skip blank lines
		continue

	# for each line, the first 2 chars is the main label
	label = line2[0:2]

	# Check if label has changed
	while label != current_label:
		# If changed, print all labels up to current level
		line1 = f1.readline()
		if (line1 == "\n") or (line1 == ""):		# skip blank lines
			break
		current_label = line1[0:2]

		if (line1[1] != ' '):				# add indent for minor heading
			fout.write("\t")
		fout.write(line1)

	fout.write("\t\t" + line2)

fout.close()
