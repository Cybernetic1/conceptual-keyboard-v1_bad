#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Read Roget's Thesaurus, extract and print original categories

import re
import sys
import os

# Read Roget's Thesaurus text file -- already removed header and footer manually
f = open("../rogets_1.htm", 'r')

# ***************** Choose output file here ****************************
# fo = sys.stdout
# fo = open("../rogets_original_brief_categories.txt", 'w')
fo = open("../rogets_original_categories.txt", 'w')
# fo = open(os.devnull, 'w')

className = False
divisionName = False
sectionName = False
subsecName = False
subsubsecName = False

subsubsecNum = 0
subsubsecNum2 = 0

last_subsubsecNum = 0

# *************************** main code *******************************

for line in f:

	if className:
		fo.write("\n\tClass " + className + ". ")
		fo.write(line[3:-6])					# remove <P> </P> wraps
		className = False
		continue

	if divisionName:
		fo.write("\n\tDivision " + divisionName + ". ")
		fo.write(line[3:-6])					# remove <P> </P> wraps
		divisionName = False
		continue

	if sectionName:
		fo.write("\n\tSection " + sectionName + ". ")
		fo.write(line[3:-6])					# remove <P> </P> wraps
		sectionName = False
		continue

	# try to recognize: <P>CLASS I</P>
	m = re.match(r"<P>CLASS ([I|V|X]+)<\/P>", line)
	if not (m is None):
		# next line is Class title
		className = m.group(1)
		continue

	# try to recognize: <P>DIVISION I.</P>
	m = re.match(r"<P>DIVISION ([I|V|X]+)<\/P>", line)
	if not (m is None):
		divisionName = m.group(1)
		continue

	# try to recognize: <P>SECTION I.</P>
	m = re.match(r"<P>SECTION ([I|V|X]+)\.<\/P>", line)
	if not (m is None):
		sectionName = m.group(1)
		continue

	# try to recognize: <P>1. Sub-section Name</P>
	m = re.match(r"<P>([0-9]+)\. ([A-Za-z ,]*)<\/P>", line)
	if not (m is None):
		subsecName = m.group(1)
		fo.write("\n\tSub-section " + subsecName + ". " + m.group(2))
		continue

	# continue					# comment this out if you want to print subsub-sections

	# try to recognize: <P><B>1.</B> <B>Existence</B> -- etc...
	# This is the level of sub-sub-sections
	m = re.match(r"<P><B>([0-9]+[a-z]?)\.<\/B>( <I>.*<\/I>)? <B>([A-Za-z \.,;&\-]*)<\/B>", line)
	if not (m is None):
		subsubsecName = m.group(1)
		fo.write("\n#" + subsubsecName + ". " + m.group(3))
		if ord(m.group(1)[-1]) < ord("A"):
			subsubsecNum = int(subsubsecName)
			if subsubsecNum != (last_subsubsecNum + 1):
				print "missing " + str(last_subsubsecNum + 1)
			last_subsubsecNum = subsubsecNum

fo.close()
