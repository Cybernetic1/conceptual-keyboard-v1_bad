#!/usr/bin/python
# -*- coding: GB18030 -*-

# Read the Chinese "Synonym Forest", extract word categories
# Output text file of categories

import codecs

# open input file
# Note: this should be the full text file of "Synonym Forest", change if needed
f = codecs.open("synonym_forest_full_2005.3.3.txt", encoding="GB18030", mode='r')

# output file
f2 = codecs.open("synonym_forest_categories.txt", encoding="GB18030", mode='w')

# for example:  the first label is "Aa01A01"
current_level = ["Z", "z", 99, "Z", 99]
current_entry = ""

for line in f:
	
	# for each line, the first 8 chars is the label
	label = line[0:8];

	# the symbol at character 8 can be: = # @
	# = means "equal", "synonymous"
	# # means "not equal", "same class", a related word
	# @ means "isolated", "unique", it has no synonym, or related word

	# If the last char is '@', ignore that label
	# This is sometimes done in the original dictionary (printed version)
	#		but there are some exceptions.  So it is commented out.
	#if label[7] == '@':
		#continue;

	new_level = [label[0], label[1], int(label[2:4]), label[4], int(label[5:7])]

	# Check if level[2] has changed
	# If changed, print current entry and then print new heading
	if new_level[2] != current_level[2]:
		f2.write(current_entry + "\n")
		current_entry = ""
		f2.write(new_level[0] + new_level[1] + str(new_level[2]).zfill(2) + ": ")
		current_level[3] = "Z"		# force level[3] to change

	# Check if level[3] has changed
	# If changed, add a word to the current entry
	if new_level[3] != current_level[3]:
		# extract the first word in text
		# Note: the -2 is needed because the original end-of-line is CR/LF (DOS format)
		first_word = line[9:-2].split(' ')[0]
		current_entry += first_word
		current_entry += " "

	current_level = new_level

f2.write(current_entry + "\n")
f2.close()
