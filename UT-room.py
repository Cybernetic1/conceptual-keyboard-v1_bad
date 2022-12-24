#encoding: utf-8

# Installation
# ============
#	pip install selenium		# make sure pip is for python 3.6
#	pip install sseclient
#	download geckodriver linux64, untar
#	move binary to /usr/local/bin/
#	pip install playsound
#	pip install pyperclip
# Now you're ready to enjoy this program.

# Running
# =======
# start geckodriver, listening port 4444
# start SSE-server.js, listening ports 8484, 8585
# run  python UT-room.py

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
from bs4 import BeautifulSoup

import signal
print("Press Ctrl-C to pause and execute your own Python code\n")
command = None

def ctrl_C_handler(sig, frame):
	# global model_name
	global command
	print("\n **** program paused ****")
	print("Enter your code (! to exit)")
	command = input(">>> ")
	# Other commands will be executed in the main loop, see below

signal.signal(signal.SIGINT, ctrl_C_handler)

my_nick = "Cybernetic1"
print("Default nick =", my_nick)
my_nick = input("Change nick to: ") or my_nick

eventStream = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

# This handles alerts such as "請勿重覆發言!":
caps = DesiredCapabilities.FIREFOX
caps["unexpectedAlertBehaviour"] = "accept"

# options = webdriver.FirefoxOptions()
# options.add_argument('log-level=3')
# options.log.level = 3

import logging
print("The following modules are logged:")
for key in logging.Logger.manager.loggerDict:
    print(key)

# Set the threshold for selenium to WARNING
# from selenium.webdriver.remote.remote_connection import LOGGER as seleniumLogger
# seleniumLogger.setLevel(logging.WARNING)
# Set the threshold for urllib3 to WARNING
# from urllib3.connectionpool import log as urllibLogger
# urllibLogger.setLevel(logging.WARNING)

# logging.getLogger('urllib3.util.retry').setLevel(logging.FATAL)
# logging.getLogger('urllib3.util').setLevel(logging.FATAL)
# logging.getLogger('urllib3').setLevel(logging.FATAL)
# logging.getLogger('urllib3.connection').setLevel(logging.FATAL)
# logging.getLogger('urllib3.response').setLevel(logging.FATAL)
# logging.getLogger('urllib3.connectionpool').setLevel(logging.FATAL)
# logging.getLogger('urllib3.poolmanager').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver.remote.utils').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver.remote').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver').setLevel(logging.FATAL)
# logging.getLogger('selenium').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver.remote.remote_connection').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver.firefox.extension_connection').setLevel(logging.FATAL)
# logging.getLogger('selenium.webdriver.firefox').setLevel(logging.FATAL)
# logging.getLogger('pyasn1').setLevel(logging.FATAL)
# logging.getLogger('urllib3.contrib.pyopenssl').setLevel(logging.FATAL)
# logging.getLogger('urllib3.contrib').setLevel(logging.FATAL)
# logging.getLogger('requests').setLevel(logging.FATAL)
# logging.getLogger('playsound').setLevel(logging.FATAL)

# from selenium.webdriver.remote.remote_connection import LOGGER as seleniumLogger
# seleniumLogger.setLevel(logging.FATAL)

# driver = webdriver.Chrome('/home/yky/Downloads/chromedriver')
# driver = webdriver.Firefox(desired_capabilities=caps)
# * Need to use "Remote" here so that Ctrl-C will not close the driver
driver = webdriver.Remote("http://127.0.0.1:4444", desired_capabilities=caps)

print("Open URL: UT网际空间 rooms list")
driver.get('http://chat.f1.com.tw/?p=chat_sort_show')

time.sleep(1)	# in seconds

driver.find_element('xpath', '/html/body/form/table/tbody/tr/td[2]/input').send_keys(my_nick)
Select(driver.find_element('xpath', '/html/body/form/table/tbody/tr/td[4]/select')).select_by_index(0) # male
Select(driver.find_element('xpath', '/html/body/form/table/tbody/tr/td[8]/select')).select_by_index(21) # Hong Kong
Select(driver.find_element('xpath', '/html/body/form/table/tbody/tr/td[10]/select')).select_by_index(50-17) # age = 50
driver.find_element('xpath', '/html/body/table[6]/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[2]/td[1]/a').click()

print("Logged into UT网际空间 聊天二房")

time.sleep(5)	# in seconds
print("Wait for loading finished")

parent_h = driver.current_window_handle
# click on the link that opens a new window
handles = driver.window_handles # before the pop-up window closes
handles.remove(parent_h)
theWindow = handles.pop()
driver.switch_to.window(theWindow)
# do stuff in the popup
# popup window closes
# browser.switch_to.window(parent_h)
# and you're back

while True:
	try:
		driver.switch_to.default_content()
		#driver.switch_to.frame(driver.find_element_by_css_selector("frame[name='c']"))
		#driver.switch_to.frame(driver.find_element_by_name("ta"))
		driver.switch_to.frame("c")
		#driver.switch_to_frame(driver.find_element_by_xpath('html/frameset/frameset[1]/frame[2]'))
		#driver.switch_to.frame(0);
		print("Switched to frame 'c'")

		inbox = driver.find_element('name', "SAYS")
		sendbutt = driver.find_element('xpath', "//input[@value='發言']");
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

driver.switch_to.default_content()
driver.switch_to.frame("m")
print("Switched to frame 'm'")

stuff = driver.find_element('xpath', "/html/body/p").get_attribute("innerHTML")
print("*** Test: <p>.text =", stuff)

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

	if command:		# **** execute commands from ctrl-C
		if command == '!':
			break
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
			# Element "p" may contain various tags such as: <table> <a> <font> <br>
			html = driver.find_element('xpath', "/html/body/p").get_attribute("innerHTML")
			soup = BeautifulSoup(html, 'lxml').find('body')
			if soup == None:
				continue
			# body = soup.body
			# break HTML block into lines
			rows = []
			line = ""
			for element in soup.childGenerator():
				if element.name == "table":
					rows.append(element.get_text().replace('\n', ''))
				elif element.name == "font":
					line += element.get_text().strip()
				elif element.name == "a":
					line += element.get_text().strip()
				elif element.name == None:
					line += element.string.strip()
				elif element.name == "br":
					rows.append(line)
					line = ""
			# find the last line in rows[] starting from the end
			newRows = []
			for line in reversed(rows):
				# print("****", line)
				# sometimes line is None due to alert message popping out in the midst of execution
				if line == previous:
					break
				if line is None:
					continue
				if len(line.strip()) == 0:
					continue
				# We need PREPEND here:
				newRows = [line] + newRows
				# print("****", i, line)
			# This fixes the problem of wrong order of lines:
			for line in newRows:
				if "我們有位朋友" in line:
					continue
				# Alert if talk directly at me:
				if ("給 [" + my_nick + "]  的密語") in line:
					playsound("dreamland-talk-to-me.wav")
					log_file.write(line + '\n')
					log_file.flush()
					prefix = '\x1b[36m'
				# Self talk to someone:
				if ("]的密語" + my_nick + "說：") in line:
					log_file.write(line + '\n')
					log_file.flush()
					prefix = '\x1b[35m'
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
driver.quit()
exit(0)
