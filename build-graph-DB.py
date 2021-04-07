# Install Neo4j
# =============
# Install Neo4j python driver:
#	pip3 install neo4j
# Install Neo4j desktop on Ubuntu, follow instructions from this link:
#	https://neo4j.com/docs/operations-manual/current/installation/linux/debian
#		/#debian-installation
# Set password:
#	sudo neo4j-admin set-initial-password l0wsecurity --require-password-change
# Open Neo4j browser:
#	http://localhost:7474/browser/
# First time use password: neo4j / neo4j
# Change password in browser.
# Now you're ready to run this program.

# Stop database and save a copy
# =============================
# command line:
#	> neo4j stop
#	> service neo4j stop
# 	> sudo neo4j-admin dump --to=graph-database.db 

from neo4j import GraphDatabase
import re

uri = "neo4j://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "l0wsecurity"))
#driver = GraphDatabase.driver(uri, auth=("neo4j", "neo4j"))

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
