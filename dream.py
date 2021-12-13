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
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchElementException, UnexpectedAlertPresentException,NoAlertPresentException
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from sseclient import SSEClient
import threading
lock = threading.Lock()

import time
from playsound import playsound
from datetime import datetime

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

print("Web site = 寻梦园 情色聊天室")
driver.get('http://ip131.ek21.com/oaca_1/?ot=1')

WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="mlogin"]/form/ul/li[1]/input'))).send_keys(my_nick)

driver.find_element_by_xpath('//*[@id="mlogin"]/form/div/span').click()
print("Logged into Dreamland")

time.sleep(6)	# in seconds
print("Wait for frame finished")

#driver.get("http://ip131.ek21.com/type_area?roomid=oaca_1&cserial=26MH_TK_CXKd")
#print("Got sub-URL")

driver.switch_to_default_content()
#driver.switch_to.frame(driver.find_element_by_css_selector("frame[name='ta']"))
#driver.switch_to.frame(driver.find_element_by_name("ta"))
driver.switch_to.frame("ta")
#driver.switch_to_frame(driver.find_element_by_xpath('html/frameset/frameset[1]/frame[2]'))
#driver.switch_to.frame(0);
print("Switched to frame 1.2 'ta' = #1")

inbox = driver.find_element_by_name("says_temp")
sendbutt = driver.find_element_by_xpath("//input[@value='送出']");
print("Acquired buttons")

# Log file, name format:  log-name.dd-mm-yyyy(hh:mm).txt
timestamp = datetime.now().strftime("%d-%m-%Y(%H:%M)")
log_file = open("logs/log-name.dream." + timestamp + ".txt", "a+")
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
				driver.switch_to.frame("ta")
				inbox.send_keys(s)
				sendbutt.click()
				break
			except NoSuchElementException:
				time.sleep(1)
				continue

t = threading.Thread(target=consume)
t.start()

driver.switch_to_default_content()
driver.switch_to.frame("ma")
print("Switched to frame 'ma'")
lastChatLine = driver.find_element_by_xpath("/html/body/div[7]/div[last()]")
print("Testing: last chat line:", lastChatLine.text)

# html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
# this is the <div> element containing the rows:
# chatWin = html.children[1].children[7];         // sometimes it's [1][7], or [3][7]
# number of lines in chat win:
# lastIndex = chatWin.childElementCount - 1;
# if ((chatWin != null) && (lastIndex > lastIp131Index)) {

# Loop to record chat log:
previous = ''
fontElement = None
sexColor = ''
prefix = ''
while True:
	time.sleep(0.5)	# in seconds
	with lock:		# This lock is against python threads
		try:
			driver.switch_to.default_content()
			driver.switch_to.frame("ma")
			# lastChatLine = driver.find_element_by_xpath("/html/body/div[7]/div[last()]")
			# Finding the last() element is faulty;
			# Should find the last(N) instead.
			lastLines = driver.find_elements_by_xpath("/html/body/div[7]/div[position()>=last()-5]")
			newLines = []
			for i, line in enumerate(reversed(lastLines)):
				# sometimes line is None due to alert message popping out in the midst of execution
				if line is None or line.text == previous:
					break
				if len(line.text.strip()) == 0:
					continue
				# We need PREPEND here:
				newLines = [line] + newLines
				# print("****", i, line.text)
			# This fixes the problem of wrong order of lines:
			for line in newLines:
				# /html/body/div[7]/div[last()]/p/font
				# /html/body/div[7]/div[9]/p/font/a/font
				if "進入1k情色皇朝聊天室" in line.text:
					try:
						fontElement = line.find_element_by_xpath("./p/font/a/font")
						sexColor = fontElement.get_attribute("color")
					except NoSuchElementException:
						sexColor = ""
				else:
					fontElement = None
					sexColor = None
				# Alert if talk directly at me:
				if ("對 訪客_" + my_nick) in line.text:
					playsound("dreamland-talk-to-me.wav")
					log_file.write(line.text + '\n')
					log_file.flush()
					prefix = '\x1b[36m'
				# Self talk to someone:
				if ("訪客_" + my_nick + " 只對") in line.text:
					log_file.write(line.text + '\n')
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
				print(prefix + line.text, end='\x1b[0m\n')
				prefix = ''
				# if len(line.text.strip()) > 0:
				previous = line.text
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

"""
# ********** Process events in a blocking manner:
for msg in eventStream:
	s = msg.data
	if s:
		inbox.send_keys(s)
		sendbutt.click()
		# Wish to get rid of mysterious blank lines in the output....
		if s[0] != "\n":
			print("fire.data:", s)
"""

"""
# ********* SSE client to print messages from localhost:8484
from sseclient import SSEClient
messages = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})
for msg in messages:
	print("fuck:", msg)
exit(0)

# ********* send HTTP messages to localhost:8484
import requests
url = 'http://localhost:8484/speakMandarin/'
myobj = '喜欢玩文字网爱吗'.encode('utf-8')
x = requests.post(url, data = myobj)
print(x.text)
exit(0)

# ********* read file via HTTP request from localhost:8484
url = 'http://localhost:8484/loadDatabase/database_default'
r = requests.get(url)
if r.content:
	data = r.text.encode('utf-8')
	print(data)
exit(0)
"""
