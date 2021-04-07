# **** Add pinyins to chars

# simplify "YKY-custom-pinyins.txt" first, using OpenCC:
#	opencc -i web/YKY-custom-pinyins.txt -o web/YKY-custom-pinyins-ZH.txt -c t2s.json

from neo4j import GraphDatabase
import re

uri = "neo4j://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "l0wsecurity"))

def create_word(tx, chars):
	tx.run("CREATE (a :Word {chars: $chars})",
		chars=chars)

def create_char(tx, char):
	tx.run("CREATE (a :Char) WHERE a.char = $char",
		char=char)

def create_rel(tx, char, chars):
	# "MERGE (b :Word {chars: $chars}) "
	tx.run( "MERGE (a :Char {char: $char}) "
			"MERGE (b :Word {chars: $chars}) "
			"MERGE (a)-[:In]->(b)",
			char=char, chars=chars)

f = open("web/YKY-custom-pinyins-ZH.txt", "r")

for i, line in enumerate(f):
	# if i > 1:		# total # lines = 116 
		# break

	# format: 字pinyin
	c = line[0]
	pinyin = line[1:]

	# for each char, add char if not exist, add pinyin if not exist, link them
	# with driver.session() as session:
		# session.write_transaction(create_word, w)
	# with driver.session() as session:
		# session.write_transaction(create_char, c)
	with driver.session() as session:
		session.write_transaction(create_rel, c, pinyin)

	print(c, ord(c), end='.')
	print()

driver.close()

exit(0)
