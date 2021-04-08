# **** Add pinyins to chars

# Simplify "YKY-custom-pinyins.txt" first, using OpenCC:
#	opencc -i web/YKY-custom-pinyins.txt -o web/YKY-custom-pinyins-ZH.txt -c t2s.json
# The encoding seems to be "hk2s" on desktop but "t2s" on laptop.
# This may be a result of the terminal's char-encoding setting.

from neo4j import GraphDatabase
import re

uri = "neo4j://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "l0wsecurity"))

def create_rel(tx, char, pinyin):
	tx.run( "MERGE (c :Char {char: $char}) "
			"MERGE (p :Pinyin {pinyin: $pinyin}) "
			"MERGE (p)-[:P2C]->(c)",
			char=char, pinyin=pinyin)

f = open("web/YKY-custom-pinyins-ZH.txt", "r")

for i, line in enumerate(f):
	# if i > 1:		# total # lines = 116 
		# break

	# format: "字pinyin\n"
	char = line[0]
	pinyin = line[1:-1]

	with driver.session() as session:
		session.write_transaction(create_rel, char, pinyin)

	print(char + ',' + str(ord(char)), end='\t')
	if i % 100 == 0:
		print()

driver.close()
f.close()
