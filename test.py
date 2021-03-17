from sseclient import SSEClient

messages = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

for msg in messages:
	s = msg.data
	print("fuck:", s)
	print("final:", s.encode('utf-8'))

exit(0)
