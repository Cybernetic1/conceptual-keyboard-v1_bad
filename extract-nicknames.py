# -*- coding: utf-8 -*-

# Rename chat-log files with the most frequent nicknames occurring in the chat

# ************** Samples *****************
#  阿豬媽 向 你 秘密的說 :
# 03:19:12 > (密) 訪客_寂寞小貓 只對 訪客_Cybernetic1 ：

import os
from collections import Counter

os.chdir("/home/yky/misc-programs/conceptual-keyboard/logs/")

for fname in os.listdir():

	if not fname.startswith("log-name."):
		continue
		# print("**** skipping: " + fname)
	else:
		restOfName = fname[9:]
		print("**** processing: " + restOfName)
		f = open(fname, 'r')

		allNicks = []

		try:
			for line in f:
				nick = ""

				i = line.find("向 你 秘密的說 :")
				if i > -1:
					nick = line[1:i - 1]
					# print("1 " + nick)

				j = line.find("只對 訪客_Cybernetic")
				if j > -1:
					nick = line[15:j - 1]
					if nick.startswith("訪客_"):
						nick = nick[3:]
					if nick.startswith("_"):
						nick = nick[1:]
					# print("2 " + nick)

				if nick is not "":
					allNicks.append(nick)
		except UnicodeDecodeError as err:
			print("Error processing line >>>>>", err.object[err.start:err.end + 60].decode("utf-8", "replace"), end="<<<<<\n\n")
			continue
		# print("all = ", allNicks)

		counts = Counter(allNicks)
		str = ""
		for s in counts.most_common(4):
			# print(s)				# most_common() is already sorted with most frequent first
			if s[1] > 2:
				str += (s[0] + '.')
		if str == '':				# probably has nicknames that speak only 1-2 lines
			for s in counts.most_common(3):
				str += (s[0] + '.')
			newName = str + restOfName
			os.rename(fname, newName)
			print(">>> error: " + newName)
		else:
			newName = str + restOfName
			os.rename(fname, newName)
			print(newName)
