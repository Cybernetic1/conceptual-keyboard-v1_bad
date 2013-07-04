#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Read Roget's Thesaurus, convert to YKY database format

import re
import sys
import os

# Read Roget's Thesaurus text file -- header and footer already manually removed
f = open("../rogets_1.htm", 'r')

# ************************ Choose output file(s) ***********************
# fo = sys.stdout
fo = open("../rogets_YKY_database.txt", 'w')
# fo = open(os.devnull, 'w')
fo2 = fo
# fo2 = open(os.devnull, 'w')

className = False
divisionName = False
sectionName = False
subsecName = False
subsubsecName = False

classNum = 0
divisionNum = 0
sectionNum = 0
subsecNum = 0
subsubsecNum = 0
subsubsecNum2 = 0

last_subsubsecNum = 0

# *************************** misc functions **************************

# Convert Roman numeral to integer (grabbed from StackOverflow)
def rom_to_int(string):

    table=[['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]]
    returnint=0
    for pair in table:

        continueyes=True

        while continueyes:
            if len(string)>=len(pair[0]):

                if string[0:len(pair[0])]==pair[0]:
                    returnint+=pair[1]
                    string=string[len(pair[0]):]

                else: continueyes=False
            else: continueyes=False

    return returnint

# *************************** main code *******************************

for line in f:

	if className:
		classNum = rom_to_int(className)
		fo.write("\n\t" + str(classNum) + ". ")
		fo.write(line[3:-6])					# remove <P> </P> wraps
		className = False
		divisionNum = 0
		sectionNum = 0
		subsecNum = 0
		subsubsecNum2 = 0
		continue

	if divisionName:
		# Ignore divisions, just keep on counting section numbers
		# divisionNum = rom_to_int(divisionName)
		divisionNum = sectionNum			# keep current section number
		sectionNum = 0							# renew
		subsecNum = 0
		# fo.write("\n\t" + str(classNum) + "." + str(divisionNum) + ". ")
		# fo.write(line[3:-6])					# remove <P> </P> wraps
		divisionName = False
		continue

	if sectionName:
		sectionNum = rom_to_int(sectionName)
		fo.write("\n\t" + str(classNum) + "." + str(divisionNum + sectionNum) + ". ")
		fo.write(line[3:-6])					# remove <P> </P> wraps
		sectionName = False
		subsecNum = 0
		subsubsecNum2 = 0
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
		subsecNum = int(subsecName)
		subsubsecNum2 = 0				# reset counter
		fo.write("\n\t" + str(classNum) + "." + str(divisionNum + sectionNum) + ".")
		fo.write(subsecName + ". " + m.group(2))
		continue

	# Sub-sub-sections
	# try to recognize: <P><B>1.</B> <B>Existence</B> -- etc...
	m = re.match(r"<P><B>([0-9]+[a-z]?)\.<\/B>( <I>.*<\/I>)? <B>([A-Za-z \.,;&\-]*)<\/B>", line)
	if not (m is None):
		subsubsecName = m.group(1)
		subsubsecNum2 = subsubsecNum2 + 1
		if subsecNum != 0:
			fo.write("\n\t" + str(classNum) + "." + str(divisionNum + sectionNum) + "." + str(subsecNum) + ".")
			fo.write(str(subsubsecNum2) + ". " + m.group(3))
			# fo.write("#" + str(subsubsecNum2) + ". " + m.group(3))
		else:
			fo.write("\n\t" + str(classNum) + "." + str(divisionNum + sectionNum) + ".")
			fo.write(str(subsubsecNum2) + ". " + m.group(3))

		# check for continuity of sub-sub-section numbers
		if ord(m.group(1)[-1]) < ord("A"):
			subsubsecNum = int(subsubsecName)
			if subsubsecNum != (last_subsubsecNum + 1):
				print "missing " + str(last_subsubsecNum + 1)
			last_subsubsecNum = subsubsecNum

	# try to extract words in each block
	# words are separated by , or ; or . -- OK
	# with optional italicized items <I> </I>
	#    which seem to be suffixes followed by "number;"
	# Sometimes italics are POS tags such as: <I>adj.;</I> -- OK
	# and optional <I> [Lat.]</I> ignored -- OK
	# and optional POS tags wrapped in <B> </B> -- OK
	# and optional "&amp;c" -- OK
	# and optional number references -- OK
	# sometimes words have suffix [...] annotations, may be ignored --
	
	# ******************* These are done manually: ********************
	# "{ant. </P>\r\n<P> to number}" is fixed with no newlines
	# <I>;</I> replaced with ;

	# print line[0:3], line[-6:-2]
	if (line[0:3] == "<P>") and (line[-6:-2] == "</P>"):
		s = line[3:-6]									# remove outermost <P>...</P>

		s = s.replace("&amp;c", "")
		s = s.replace("<SUP>&dagger;</SUP>", "")

		s = s.replace("<B>N.</B>", "")
		s = s.replace("<B>V.</B>", "")
		s = s.replace("<B>Adj.</B>", "")
		s = s.replace("<B>Adv.</B>", "")
		s = s.replace("<B>Phr.</B>", "")
		s = s.replace("<I>n.;</I>", ";")
		s = s.replace("<I>v.;</I>", ";")
		s = s.replace("<I>adj.;</I>", ";")
		s = s.replace("<I>adv.;</I>", ";")
		s = s.replace("<I>n.,</I>", ",")
		s = s.replace("<I>v.,</I>", ",")
		s = s.replace("<I>adj.,</I>", ",")
		s = s.replace("<I>adv.,</I>", ",")
		s = s.replace("<I>n.</I>", "")
		s = s.replace("<I>v.</I>", "")
		s = s.replace("<I>adj.</I>", "")
		s = s.replace("<I>adv.</I>", "")
		s = s.replace("<I>phr.</I>", "")

		s = s.replace("<I> [Lat.]</I>", "")
		s = s.replace("<I> [Fr.]</I>", "")
		s = s.replace("<I> [Contr.]</I>", "")

		# ********** Italics items <I>...</I> ***************
		# If it is <I>(something)</I> we may want to retain.
		# For example "<I>(property)</I> 780"
		for q in re.findall(r"<I>.*?</I>", s):				# italics
			# perhaps we want to splice out the italics...?
			if (q[3] != "[") and (q[4] != "["):
				fo2.write("\n" + q[3:-4])
			# else:
				# fo2.write("\n-------------------------> " + q)
			s = s.replace(q, "")

		# ********** suffix annotations within [...] ************
		# They can usually be ignored
		for q in re.findall(r"\[.*?\]", s):					# [...] annotations
			s = s.replace(q, "")
			# fo2.write("\n-------------------------X " + q)

		m = re.findall(r"\s+(--)?\s*([A-Za-z \'\-\[\]]+)([0-9 ]+)?[,;.]", s)
		for q in m:
			# sometimes this could be empty space
			if q[1].strip() != "":
				fo2.write("\n" + q[1])

fo2.write("\n")
fo.close()
fo2.close()
