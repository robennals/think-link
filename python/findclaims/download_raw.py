"""
Given a list of URLs, download the first 400k of each URL, and then save
every string that contains a known pattern.
We do not bother to strip out HTML, and divide URLs by pattern.

URLs may come from a database, or simply from a file with a big list of URLs.
"""

from nlptools import remove_exact_duplicates, csv_writer, trim_to_words
from nlptools import normalize_space
import urllib2
import threading
import socket
import urllib
import os
import re
import nlptools.urlcache as uc
import random

here = os.path.dirname(__file__)

socket.setdefaulttimeout(2)

num_threads = 200


urls = []

def download_urls():
	threads = []
	for num in range(0,num_threads):
		t = DownloadThread() 
		t.start()
		threads.append(t)
	for t in threads:
		t.join()

totaldownloaded = 0	
totalfiles = 0
timeouts = 0

class DownloadThread(threading.Thread):
	"""Find patterns in urls"""
	def run(self):
		global totaldownloaded
		global totalfiles
		global urls
		global timeouts 
		print "thread running"
		while len(urls) > 0:
			url = urls.pop()
			if url.endswith("pdf"): continue
			try:
				content = uc.get_cached_url("pages",url,400000,2).read()			
				totaldownloaded += len(content)
				totalfiles += 1
				if totalfiles % 10 == 0:
					print "size:",len(content),"avg:",(totaldownloaded/totalfiles),"tot:",totaldownloaded,"cnt:",totalfiles,"tmo:",timeouts,"url:",url[:50]
			except:	
				timeouts += 1	

def load_urls(filename):
	global urls
	urls = [line.strip() for line in file(filename)]
	random.shuffle(urls)

def load_default():
	load_urls("../output/page_urls.txt")

