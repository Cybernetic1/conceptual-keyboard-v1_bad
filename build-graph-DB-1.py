# **** Add pinyins to chars

# Simplify "YKY-custom-pinyins.txt" first, using OpenCC:
#	opencc -i web/YKY-custom-pinyins.txt -o web/YKY-custom-pinyins-ZH.txt -c t2s.json
# **** But OpenCC sucks because it leaves garbage characters,
# **** had to use hcutf8-YKY.txt instead.  Use simplify.py.

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
size = 24933

for i, line in enumerate(f):
	# format: "字pinyin\n"
	char = line[0]
	pinyin = line[1:-1]

	with driver.session() as session:
		session.write_transaction(create_rel, char, pinyin)

	print(i, "{:.1f}".format(i * 100 / size) + '%', char, str(ord(char)), "                              ", end='\r')

print()
driver.close()
f.close()
