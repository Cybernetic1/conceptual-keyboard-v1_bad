#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Notice that by pinyin I mean spellings for Cantonese.

# Input: list with char + pinyin
# Output: list of unique pinyins

import sys

f1 = open("web/exact-Google-pinyins.txt", "r")			# format: "字pinyin" or "字字pinyin pinyin"

# Output Format:
# consonant
# nucleus

consonants = [ 'b','p','m','f','d','t','n','l','g','k','h','j','q','w','x','y','r' ]
# 'zh','ch','sh','z','c','s' are treated as special cases

vowels = ['a', 'e', 'i', 'o', 'u']		# 'y' may be special case?

ks = set()
ns = set()

# ***** convert to consonant-nucleus form *****
def k_n(pinyin_):
	# test for special cases:  z,c,s,zh,ch,sh
	c = pinyin_[0]
	consonant = ""
	nucleus = ""
	if c in vowels:							# consonant doesn't exist
		nucleus = pinyin_
		return [consonant, nucleus]

	consonant = c
	if len(pinyin_) == 1:					# only 1 pinyin letter, eg 'm'
		return [consonant, ""]

	c = pinyin_[1]
	if c in vowels:							# 1 consonant followed by vowel(s)
		nucleus = pinyin_[1:]
		return [consonant, nucleus]

	consonant += c
	if len(pinyin_) == 2:					# only 2 pinyin letters, eg 'ng'
		return [consonant, ""]
	
	c = pinyin_[2]
	if not c in vowels and c != 'y':		# 'y' is special vowel
		print("abnormal: >2 consonants")
		print(line)
		return ["", ""]
	else:
		nucleus = pinyin_[2:]
		return [consonant, nucleus]

for line in f1:
	if ord(line[1]) > 127:				# ignore phrases for now
		continue

	pinyin = line[1:-1]						# last char is '\n'
	# print (pinyin)

	[k, n] = k_n(pinyin)
	ks.add(k)
	ns.add(n)

fo = sys.stdout
# fo = open("Google-unique-pinyins.txt", "w")

fo.write('// consonants:\n')

for k in ks:
	fo.write(k + '\n')

fo.write('// vowels:\n')

for n in ns:
	fo.write(n + '\n')

fo.close()
