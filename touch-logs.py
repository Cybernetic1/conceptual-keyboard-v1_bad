# -*- coding: utf-8 -*-

# Touch chat-log files with the date/time in its filename

import os
import re
from datetime import datetime

os.chdir("/home/yky/misc-programs/conceptual-keyboard/logs/")

# Example:  XXXX.2-24-2019(15:44).txt
#			XXXX.4-2-2019(1:2).txt

for fname in os.listdir():

	# Try to extract date/time from filename
	s = fname.rsplit('.', 2)
	if len(s) == 2:
		date_time = s[0]
		txt = s[1]
	else:
		date_time = s[1]
		txt = s[2]

	if txt != "txt":
		print("Error: filename extension is not '.txt' :", fname)
		continue

	print(">>>>>", fname)

	m = re.search('([0-9]+)-([0-9]+)-([0-9]+)\(([0-9]+):([0-9]+)\)', date_time)
	MM = int(m.group(1))
	DD = int(m.group(2))
	YYYY = int(m.group(3))
	hh = int(m.group(4))
	mm = int(m.group(5))

	stats = os.stat(fname)

	# print(YYYY, MM, DD, hh, mm)
	stamp = datetime(YYYY, MM, DD, hh, mm, 0)
	t = datetime.timestamp(stamp)

	if t - stats.st_mtime < 61.0:
		continue

	print(stamp)
	with open(fname, 'a'):
		os.utime(fname, (stats.st_atime, t))
