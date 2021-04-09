fo = open("out.txt", "wb")

while True:
	try:
		s = input()
	except:
		break
	s2 = s.replace('%','\\')
	# 'surrogateescape'
	s = s2.encode('utf8')
	print('s=', s)
	s2 = s.decode('unicode-escape') + '\n'
	# s3 = s2.encode('utf8', 'surrogateescape')
	# print('s2=', s3)
	# newFileByteArray = bytearray(s2, 'UTF8')
	# fo.write(newFileByteArray)
	fo.write(s2.encode('utf8'))

fo.close()
