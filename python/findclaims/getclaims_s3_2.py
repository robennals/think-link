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
import json
import makedb.mapreduce as mapreduce
from claim_from_body import claims_from_html2
import getclaims
import nlptools


conn = S3.AWSAuthConnection(s.amazon_access,s.amazon_secret)

num_threads = 200

outstore = mapreduce.OutStore("/mnt/output.store")
infile = None

def download_urls():
	threads = []
	for num in range(0,num_threads):
		t = DownloadThread() 
		t.start()
		threads.append(t)
	for t in threads:
		t.join()

totalfiles = 0
timeouts = 0
errors = 0
backoff = 0
running = True
started = None

lock = threading.Lock()


def download_loop():
	global outstore
	global backoff
	global errors
	global running
	global timeouts
	global totalfiles
	global started
		
#	backoff = 0
	while running:
		lock.acquire()
		line = infile.next().split("\t")
		lock.release()
		try:
			(date,url,query) = [nlptools.trim_ends(x) for x in line]
		except:
			print "badline:",line
		if backoff > 0:
			time.sleep(backoff)
		if url.endswith("pdf"): continue
		try:
			if not started:
				started = time.time()
			urlin = urllib2.urlopen(url,None,4)
			content = urlin.read(400000)
			urlin.close()
			lock.acquire()
			getclaims.process_content(outstore,date,url,query,content)
			lock.release()
			totalfiles += 1
			rate = totalfiles/(time.time()-started)
			if totalfiles % 100 == 0:
				print "rate:",rate,"bak:",backoff,"err:",errors,"cnt:",totalfiles,"tmo:",timeouts
				if backoff > 0:
					backoff -= 1
		except Exception as e:
			dsc = e.__str__()
			print e
			lock.acquire()
			outstore.emit(url,{'error':dsc})
			lock.release()
			if "timed out" in dsc: timeouts+=1
			if "name resolution" in dsc: 
				print "-- name resolution overload, backing off --"
				backoff +=1
				print "backoff = ",backoff

class DownloadThread(threading.Thread):
	"""Find patterns in urls"""
	def run(self):
		print "thread running"
		download_loop()	
		print "thread finished"

# data should have been shuffled in advance
def main(args):
	global infile
	infile = file(args[1])
	download_urls()

if __name__ == "__main__":
	main(sys.argv)
