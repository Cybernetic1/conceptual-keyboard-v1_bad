# Installation
# ============
#	pip3 install selenium
#	pip3 install sseclient
#	download geckodriver linux64, untar
#	move binary to /usr/local/bin/
# Now you're ready to enjoy this program.

#encoding: utf-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from sseclient import SSEClient
import time

eventStream = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

# driver = webdriver.Chrome('/home/yky/Downloads/chromedriver')
driver = webdriver.Firefox()

driver.get('http://ip131.ek21.com/oaca_1/?ot=1')

WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="mlogin"]/form/ul/li[1]/input'))).send_keys("Cybernetic1")

driver.find_element_by_xpath('//*[@id="mlogin"]/form/div/span').click()

print("Entered Dreamland")

time.sleep(6)
print("Wait for frame exited")

#driver.get("http://ip131.ek21.com/type_area?roomid=oaca_1&cserial=26MH_TK_CXKd")
#print("Got sub-URL")

#driver.switch_to_default_content()
#driver.switch_to.frame(driver.find_element_by_css_selector("frame[name='ta']"))
#driver.switch_to.frame(driver.find_element_by_name("ta"))
driver.switch_to.frame("ta")
#driver.switch_to_frame(driver.find_element_by_xpath('html/frameset/frameset[1]/frame[2]'))
#driver.switch_to.frame(0);
print("Switched to frame 1.2 'ta' = #1")

inbox = driver.find_element_by_name("says_temp")
sendbutt = driver.find_element_by_xpath("//input[@value='送出']");
print("Acquired buttons")

for msg in eventStream:
	s = msg.data
	print("fire.data:", s)
	if s:
		inbox.send_keys(s)
		sendbutt.click()

exit(0)

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
