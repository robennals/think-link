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
from urllib2 import URLError
import os
import re
import random
import secret as s
import fileinput
import S3
import time
import threading
import sys
import pdb

conn = S3.AWSAuthConnection(s.amazon_access,s.amazon_secret)

num_threads = 200

urls = []
downloaded = {}

def download_urls():
	threads = []
	for num in range(0,num_threads):
		t = DownloadThread() 
		t.start()
		threads.append(t)
	for t in threads:
		t.join()
	if len(urls_done) > 0:
		save_urls()


totaldownloaded = 0	
totalfiles = 0
timeouts = 0
errors = 0
outname = None
outcount = 0

started = None

urls_done = []

backoff = 0


def download_loop():
	global totaldownloaded
	global totalfiles
	global urls
	global timeouts 
	global started
	global errors
	global urls_done
	global outcount
	global backoff
#	backoff = 0
	while len(urls) > 0:		
		url = urls.pop()
		if backoff > 0:
			time.sleep(backoff)
		if url.endswith("pdf"): continue
		try:
			if not started:
				started = time.time()
			urlin = urllib2.urlopen(url,None,4)
			content = urlin.read(400000)
			urlin.close()
			conn.put("claimfinder-download",url,content)
			totaldownloaded += len(content)
			totalfiles += 1
			urls_done.append(url)
			rate = totalfiles/(time.time()-started)
			if totalfiles % 10 == 0:
				print "rate:",rate,"bak:",backoff,"err:",errors,"size:",len(content),"avg:",(totaldownloaded/totalfiles),"tot:",totaldownloaded,"cnt:",totalfiles,"tmo:",timeouts
				if backoff > 0:
					backoff -= 1
			if totalfiles % 10000 == 0:
				save_urls()
		except URLError as e:
			if hasattr(e,"reason"):
				if "timed out" in e.reason:
					print "timed out:",url
					timeouts += 1	
				elif "name resolution" in e.reason:
					print "-- name resolution overload, backing off --"
					backoff += 1
					urls.append(url) 	# try it again after waiting a bit	
				else:
					print "'"+str(e.reason)+"'"
#					pdb.set_trace()					
					print "error:",e.reason,"-",url	
					errors += 1							
			backoff += 1
		except Exception as e:
			print "unknown error:",url
			backoff += 1
			errors += 1
			print "backoff =",backoff
			print e

def save_urls():
	global urls_done
	global outcount
	allurls = "\n".join(urls_done)
	urls_done = []
	outcount += 1
	key = "urls-"+outname+"."+str(outcount)
	conn.put("claimfinder-urlsdone",key,allurls)		
		

class DownloadThread(threading.Thread):
	"""Find patterns in urls"""
	def run(self):
		print "thread running"
		download_loop()	
		print "thread finished"


urlpat = re.compile("http://([^/]*)/")

def gethost(url):
	m = urlpat.match(url)
	if m:
		return m.group(1)
	else:
		return None

# data should have been shuffled in advance
def main(args):
	global urls
	global outname
	outname = args[1]
	urls = [line.strip() for line in file(args[2])]
	download_urls()

if __name__ == "__main__":
	main(sys.argv)
