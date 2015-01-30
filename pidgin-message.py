#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  pidgin.py
#  
#  Original Copyright 2012 Ángel Araya <angel@angel-TECRA-A8>

# def listener(conv, type):
#	print (type) #Debug line
#	if type == 4: # Corresponds to UNSEEN_STATE_CHANGED and others I can't distinguish now
#		print ("Status changed, possibly read messages")

import sys
from subprocess import call
import dbus, gobject
# from dbus.mainloop.glib import DBusGMainLoop

# dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
bus = dbus.SessionBus()

obj = bus.get_object("im.pidgin.purple.PurpleService", "/im/pidgin/purple/PurpleObject")
purple = dbus.Interface(obj, "im.pidgin.purple.PurpleInterface")

ims = purple.PurpleGetIms()

user = sys.argv[1]				# first argument = user name
msg = ' '.join(sys.argv[2:])	# the rest is message
# msg = sys.argv[1][1:-1]		# remove quotes
if msg == "":
	print "Please enter something to message"
	print "number of open chats:", len(ims)
	exit()

# if len(ims) == 1, always send to that person
# if len != 1, send to Pudding if Pudding exists
# if len != 1, send to Hanasaki if Hanasaki exists 

if user == "auto":
	if len(ims) != 1:
		call(["beep", "-f", "100"])
		exit()
	for conv in ims:
		purple.PurpleConvImSend(purple.PurpleConvIm(conv), msg)
		exit()

# to specific user:
for conv in ims:
	if purple.PurpleConversationGetName(conv) == user:
		purple.PurpleConvImSend(purple.PurpleConvIm(conv), msg)
		exit()

#~ if len(ims) == 1:
	#~ for conv in ims:
		#~ purple.PurpleConvImSend(purple.PurpleConvIm(conv), msg)
		#~ exit()

# 軟軟小布丁
#~ for conv in ims:
	#~ # print "conversation number:", conv
	#~ # purple.PurpleConversationGetTitle(conv).encode('utf-8-sig') == "軟軟小布丁":
	#~ if purple.PurpleConversationGetName(conv) == "886939769022":	# 軟軟小布丁's number
		#~ # print purple.PurpleConvIm(conv)
		#~ # print "sending message:", msg
		#~ purple.PurpleConvImSend(purple.PurpleConvIm(conv), msg)
		#~ exit()

# Hanasaki
#~ for conv in ims:
	#~ if purple.PurpleConversationGetName(conv) == "8615010095417":	# Hanasaki
		#~ purple.PurpleConvImSend(purple.PurpleConvIm(conv), msg)
		#~ exit()

# if len != 1, send to all windows that are on screen
#~ for conv in ims:
	#~ print purple.PurpleConversationGetName(conv)
	#~ print "Focus:", purple.PurpleConversationHasFocus(conv)
	#~ print "IM data: ", purple.PurpleConversationGetImData(conv)
	#~ print "data: ", purple.PurpleConversationGetChatData(conv)
	#~ print

# bus.add_signal_receiver(listener,
#                        dbus_interface="im.pidgin.purple.PurpleInterface",
#                        signal_name="ConversationUpdated")
 
# loop = gobject.MainLoop()
# loop.run()
