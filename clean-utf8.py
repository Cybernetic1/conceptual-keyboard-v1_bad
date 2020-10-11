# -*- coding: utf-8 -*-

# Clean chat-log files of non-UTF-8 chars

import os
from termcolor import colored

os.chdir("/home/yky/misc-programs/conceptual-keyboard/logs/")

for fname in os.listdir():

	if not fname.startswith("log-name."):
		continue
		# print("**** skipping: " + fname)
	else:
		restOfName = fname[9:]
		print("processing: " + restOfName)
		f  = open(fname, 'r')
		f2 = open("test.txt", 'w')

		iterobject = iter(f)
		while iterobject:
			try:
				line = next(iterobject)
				f2.write(line)
			except StopIteration:
				break
			except UnicodeDecodeError as err:
				print(colored("Error line >>>>> ", "red"), end='')
				print(err.object[err.start:err.end + 60].decode("utf-8", "replace"), end="<<<<<\n\n")
				blob = err.object[0:err.start].decode("utf-8", "replace")
				f2.write(blob)
				blob = err.object[err.end:].decode("utf-8", "replace")
				f2.write(blob)

		newName = "LOG-name." + restOfName
		os.rename(fname, newName)
		os.rename("test.txt", fname)
		print(newName)
