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

f = open("web/chinese-words.txt", "r")

for i, line in enumerate(f):
	# if i > 1:		# total # lines = 116 
		# break

	words = re.split('\n|\t', line)
	for w in words:
		if w == '':
			continue
		""" #### remove rubbish, now cleaned by:
			#### sed s/$'\u202c'//g file1 > file2
		if w[-1] == '\u202d':	# rubbish chars
			print('====================')
			input()
			w = w[:-1]
		if w[0] == '\u202c':
			print('--------------------')
			input()
			w = w[1:]
		"""
		# with driver.session() as session:
			# session.write_transaction(create_word, w)
		for c in w:
			# with driver.session() as session:
				# session.write_transaction(create_char, c)
			with driver.session() as session:
				session.write_transaction(create_rel, c, w)

			print(c, ord(c), end='.')
		print()

driver.close()

exit(0)
