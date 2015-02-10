#!/usr/bin/env python
# -*- coding: utf-8 -*-

from subprocess import call
import dbus, gobject

bus = dbus.SessionBus()
obj = bus.get_object("im.pidgin.purple.PurpleService", "/im/pidgin/purple/PurpleObject")
purple = dbus.Interface(obj, "im.pidgin.purple.PurpleInterface")

ims = purple.PurpleGetIms()

f = open('/home/yky/NetbeansProjects/conceptual-keyboard/pidgin-names.txt', 'w')

# f.write(str(len(ims)) + '\n')		# first line is the number of chat windows

for conv in ims:
	f.write(purple.PurpleConversationGetName(conv) + '\n')
	f.write(purple.PurpleConversationGetTitle(conv).encode('utf-8') + '\n')
	# print "Focus: ", purple.PurpleConversationHasFocus(conv)
	# print "IM data: ", purple.PurpleConversationGetImData(conv)
	# print "data: ", purple.PurpleConversationGetChatData(conv)
	# print

call(["beep", "-f", "100"])
exit()
