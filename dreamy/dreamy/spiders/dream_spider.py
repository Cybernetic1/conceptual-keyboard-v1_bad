#encoding: utf-8
import scrapy

def authentication_failed(response):
	# TODO: Check the contents of the response and return True if it failed
	# or False if it succeeded.
	print("failed!")

class LoginSpider(scrapy.Spider):
	name = 'dream'
	start_urls = ['http://ip131.ek21.com/oaca_1/?ot=1']

	def parse(self, response):
		return scrapy.FormRequest.from_response(
			response,
			formdata={'username': 'Cybernetic1', 'password': ''},
			callback=self.after_login
		)

	def after_login(self, response):
		self.logger.error("Login failed")
		print("here!")
		if authentication_failed(response):
			print("Login failed")
			return

		# continue scraping with authenticated session...
		print('login successful!')

exit(0)

from sseclient import SSEClient
import time

eventStream = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

driver = webdriver.Chrome('/home/yky/Downloads/chromedriver')

driver.get('http://ip131.ek21.com/oaca_1/?ot=1')

WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="mlogin"]/form/ul/li[1]/input'))).send_keys("Cybernetic1")

driver.find_element_by_xpath('//*[@id="mlogin"]/form/div/span').click()

print("Entered Dreamland")

time.sleep(6)
# driver.implicitly_wait(30)
# element = WebDriverWait(driver, 60).until(EC.visibility_of_element_located((By.XPATH, 'html/frameset/frameset[1]/frame[2]')))
print("Wait for frame exited")

#driver.get("http://ip131.ek21.com/type_area?roomid=oaca_1&cserial=26MH_TK_CXKd")
#print("Got sub-URL")

#driver.switch_to_default_content()
#driver.switch_to.frame(driver.find_element_by_css_selector("frame[name='ta']"))
#driver.switch_to.frame("ta")
#driver.switch_to_frame(driver.find_element_by_xpath('html/frameset/frameset[1]/frame[2]'))
#driver.switch_to.frame(0);
#print("Switched to frame 1.2 'ta' = #1")

#WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "/html/body/table/tbody/tr[1]/td[2]/form[5]/p[1]/input[2]"))).send_keys("abc")
#print("Typed ABC")

inbox = driver.find_element_by_name("says_temp")
sendbutt = driver.findElement(By.xpath("//input[@value='送出']"));
print("Acquired buttons")

for msg in eventStream:
	print("fuck:", msg.data)
	inbox.send_keys(msg.data)
	sendbutt.click()

exit(0)

from sseclient import SSEClient

messages = SSEClient('http://localhost:8484/dreamstream',
	headers={'Content-type': 'text/plain; charset=utf-8'})

for msg in messages:
	print("fuck:", msg)

exit(0)

import requests

url = 'http://localhost:8484/speakMandarin/'

myobj = '喜欢玩文字网爱吗'.encode('utf-8')

x = requests.post(url, data = myobj)
print(x.text)
exit(0)

url = 'http://localhost:8484/loadDatabase/database_default'

r = requests.get(url)
if r.content:
	data = r.text.encode('utf-8')
	print(data)
exit(0)

