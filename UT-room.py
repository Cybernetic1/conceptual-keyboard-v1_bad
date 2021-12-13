# Installation
# ============
#	pip install selenium		# make sure pip is for python 3.6
#	pip install sseclient
#	download geckodriver linux64, untar
#	move binary to /usr/local/bin/
#	pip install playsound
# Now you're ready to enjoy this program.

#encoding: utf-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchElementException, UnexpectedAlertPresentException,NoAlertPresentException
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from sseclient import SSEClient
import threading
lock = threading.Lock()

import time
from playsound import playsound
from datetime import datetime
import pyperclip	# access clipboard

my_nick = "Cybernetic1"
print("Default nick =", my_nick)
my_nick = input("Change nick to: ") or my_nick

eventStream = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

# This handles alerts such as "請勿重覆發言!":
caps = DesiredCapabilities.FIREFOX
caps["unexpectedAlertBehaviour"] = "accept"

# driver = webdriver.Chrome('/home/yky/Downloads/chromedriver')
driver = webdriver.Firefox(desired_capabilities=caps)

print("Open URL: UT网际空间 rooms list")
driver.get('http://chat.f1.com.tw/?p=chat_sort_show')

time.sleep(1)	# in seconds

driver.find_element_by_xpath('/html/body/form/table/tbody/tr/td[2]/input').send_keys(my_nick)
Select(driver.find_element_by_xpath('/html/body/form/table/tbody/tr/td[4]/select')).select_by_index(0) # male
Select(driver.find_element_by_xpath('/html/body/form/table/tbody/tr/td[8]/select')).select_by_index(21) # Hong Kong
Select(driver.find_element_by_xpath('/html/body/form/table/tbody/tr/td[10]/select')).select_by_index(50-17) # age = 50
driver.find_element_by_xpath('/html/body/table[6]/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[2]/td[1]/a').click()

print("Logged into UT网际空间 聊天二房")

time.sleep(2)	# in seconds
print("Wait for loading finished")

parent_h = driver.current_window_handle
# click on the link that opens a new window
handles = driver.window_handles # before the pop-up window closes
handles.remove(parent_h)
theWindow = handles.pop()
driver.switch_to_window(theWindow)
# do stuff in the popup
# popup window closes
# browser.switch_to_window(parent_h)
# and you're back

while True:
	try:
		driver.switch_to_default_content()
		#driver.switch_to.frame(driver.find_element_by_css_selector("frame[name='c']"))
		#driver.switch_to.frame(driver.find_element_by_name("ta"))
		driver.switch_to.frame("c")
		#driver.switch_to_frame(driver.find_element_by_xpath('html/frameset/frameset[1]/frame[2]'))
		#driver.switch_to.frame(0);
		print("Switched to frame 'c'")

		inbox = driver.find_element_by_name("SAYS")
		sendbutt = driver.find_element_by_xpath("//input[@value='發言']");
		print("Acquired buttons")
		break
	except UnexpectedAlertPresentException:
		# **** We cannot use unexpectedAlertBehaviour = "accept" and process the alert too
		# alert = driver.switch_to.alert
		# alert.accept()
		# print("Alert skipped:", alert.text)
		print("\x1b[31mAlert skipped, message unknown\x1b[0m")
		time.sleep(1)
		continue

# Log file, name format:  log-name.dd-mm-yyyy(hh:mm).txt
timestamp = datetime.now().strftime("%d-%m-%Y(%H:%M)")
log_file = open("logs/log-name.UT." + timestamp + ".txt", "a+")
print("Log file opened:", timestamp)

def consume():
	print("Event handling thread started...")
	for msg in eventStream:
		s = msg.data
		if s and s[0] != '\n':
			callback(s)

def callback(s):
	global inbox, sendbutt
	print("\x1b[30;45m>>", s, end="\x1b[0m\n")
	#log_file.write(">> " + s + '\n')
	#og_file.flush()
	while True:
		with lock:
			try:
				driver.switch_to.default_content()
				driver.switch_to.frame("c")
				inbox.send_keys(s)
				sendbutt.click()
				break
			except NoSuchElementException:
				time.sleep(1)
				continue

t = threading.Thread(target=consume)
t.start()

import signal
print("Press Ctrl-C to pause and execute your own Python code\n")
command = None

def ctrl_C_handler(sig, frame):
	# global model_name
	global command
	print("\n **** program paused ****")
	print("Enter your code (! to exit)")
	command = input(">>> ")
	if command == '!':
		exit(0)
	# Other commands will be executed in the main loop, see below

signal.signal(signal.SIGINT, ctrl_C_handler)

driver.switch_to_default_content()
driver.switch_to.frame("m")
print("Switched to frame 'm'")

stuff = driver.find_element_by_xpath("/html/body/p")
print("*** Test: <p>.text =", stuff.text)

# inp = 'rows = driver.find_elements_by_xpath("/html/body/p/table")'
# while True:
	# pyperclip.copy(inp)
	# exec(inp)
	# print("rows =", rows)
	# inp = input(">>> ")

# Loop to record chat log:
previous = ''
fontElement = None
sexColor = ''
prefix = ''
while True:
	time.sleep(0.5)	# in seconds

	if command:
	try:
		exec(command)
	except Exception as e:
		print("Exception:")
		print(e)
	finally:
		command = None

	with lock:		# This lock is against python threads
		try:
			driver.switch_to.default_content()
			driver.switch_to.frame("m")
			# Element "p" contains <table> rows
			rows = driver.find_elements_by_xpath("/html/body/p/table")
			# find the last line in rows[] starting from the end
			newRows = []
			for row in reversed(rows):
				line = row.text
				# print("****", line)
				# sometimes line is None due to alert message popping out in the midst of execution
				if line == previous:
					break
				if line is None:
					continue
				if len(line.strip()) == 0:
					continue
				# We need PREPEND here:
				newRows = [row] + newRows
				# print("****", i, line)
			# This fixes the problem of wrong order of lines:
			for row in newRows:
				line = row.text
				if "我們有位朋友" in line:
					try:
						fontElement = row.find_element_by_xpath("./font")
						sexColor = fontElement.get_attribute("color")
					except NoSuchElementException:
						sexColor = ""
				else:
					fontElement = None
					sexColor = None
				# Alert if talk directly at me:
				if ("給 [" + my_nick + "] 的密語") in line:
					playsound("dreamland-talk-to-me.wav")
					log_file.write(line + '\n')
					log_file.flush()
					prefix = '\x1b[36m'
				# Self talk to someone:
				if ("] 的密語 " + my_nick + " 說：") in line:
					log_file.write(line + '\n')
					log_file.flush()
					prefix = '\x1b[35m'
				# Alert if new comer joins chat:
				if fontElement:
					#print("********* New comer joined")
					#print("fondElement =", fontElement)
					if sexColor == "#FF88FF":
						playsound("dreamland-new-joiner.wav")
						prefix = '\x1b[32m【女】'
					else:
						prefix = '【男】'
				# Chat window has new content, display in console:
				print(prefix + line, end='\x1b[0m\n')
				prefix = ''
				# if len(line.text.strip()) > 0:
				previous = line
		except UnexpectedAlertPresentException:
			# **** We cannot use unexpectedAlertBehaviour = "accept" and process the alert too
			# alert = driver.switch_to.alert
			# alert.accept()
			# print("Alert skipped:", alert.text)
			print("\x1b[31mAlert skipped, message unknown\x1b[0m")
			time.sleep(2)
			continue
		except (WebDriverException, NoAlertPresentException):
			time.sleep(2)
			print("\x1b[31mSome exception caught\x1b[0m")
			continue

log_file.close()
driver.close()
exit(0)
