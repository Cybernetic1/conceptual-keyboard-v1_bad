# **** Add freqs to chars / words

# PREPROCESSING:
# **** (1) The frequencies have been merged by merge-freqs.py.
# **** (2) The merged file is already in simplified chars

# Algorithm:
# For each char / word, try to match in DB, if exists then add freq.

# SIDE-EFFECTS:
# * May create words with no char-decomposition

from neo4j import GraphDatabase
import re

uri = "neo4j://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "l0wsecurity"))

def merge_char(tx, char, freq):
	tx.run("MERGE (c :Char {char: $char}) "
		   "ON MATCH "
		   "	SET c.freq = $freq "
		   "ON CREATE "
		   "	SET c.freq = $freq",
		char=char, freq=freq)

def merge_word(tx, chars):
	tx.run("MERGE (w :Word {chars: $chars}) "
		   "ON MATCH "
		   "	SET w.freq = $freq "
		   "ON CREATE "
		   "	SET c.freq = $freq",
		chars=chars, freq=freq)

f = open("web/merged-freqs.txt", "r")
size = 15135

for i, line in enumerate(f):
	# format: "字字... (space) freq/n"
	item, freqStr = line.split(' ')
	freqStr = freqStr[:-1]
	freq = float(freqStr)

	# must print this first because of '\r'
	print(i, "{:.1f}".format(i * 100 / size) + '%', item + ',' + freqStr,
	"               ", end='\r')

	with driver.session() as session:
		if len(item) == 1:
			result = session.run(
			"MERGE (c :Char {char: $char}) "
			"ON MATCH "
			"	SET c.freq = $freq "
			"ON CREATE "
			"	SET c.freq = $freq", char=item, freq=freq)
		else:
			result = session.run(
			"MERGE (w :Word {chars: $chars}) "
			"ON MATCH "
			"	SET w.freq = $freq "
			"ON CREATE "
			"	SET w.freq = $freq", chars=item, freq=freq)
		n = result.consume().counters.nodes_created
		# record = result.single()   # Node data
		if n > 0:
			print("                              ", i, item, "is new!")

print('\n')
driver.close()
f.close()
