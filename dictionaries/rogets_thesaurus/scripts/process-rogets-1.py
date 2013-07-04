#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Read Roget's Thesaurus, pre-process it

# There is only 1 operation:  In the original HTML file, newlines can
#		occur within <P>...</P> elements.  This script removes all such
#		newlines.

import re
import sys

# Read Roget's Thesaurus text file, header and footer manually removed already
f = open("../10681-h-body.htm", 'r')
fo = open("../rogets_1.htm", 'w')

in_para = False
long_line = ""

for line in f:

	if re.search(r"\<(p|P)\>", line):
		in_para = True

	if re.search(r"\<\/(p|P)\>", line):
		in_para = False
		fo.write(long_line + line)
		long_line = ""

	if in_para:			# we have a new-line inside a <p>
		long_line = long_line + line[0:-2] + " ";

if in_para:
	fo.write(long_line)

exit()
