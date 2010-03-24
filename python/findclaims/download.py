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


here = os.path.dirname(__file__)

socket.setdefaulttimeout(2)

num_threads = 100

def download_urls(urls,outfilename):
	urls = remove_exact_duplicates(urls)
	writer = csv_writer(outfilename)
	threads = []
	for num in range(0,num_threads):
		t = DownloadThread(urls,writer) 
		t.start()
		threads.append(t)
	for t in threads:
		t.join()
	outfile.close()
	
class DownloadThread(threading.Thread):
	"""Find patterns in urls"""
	def __init__(self, urls, writer):
		self.urls = urls
		self.writer = writer
		
	def run(self):
		if len(self.urls) > 0:
			url = self.urls.pop()
			process_url(url,self.writer)


def process_url(url,writer):
	content = urllib2.urlopen(url,None,2).read(400000)
	matches = find_all_matches(content)			
	for m in matches:
		writer.writerow([url,m])
	


patterns = [line.lower().strip() for line in file(here+"/patterns.txt")]
	
def find_all_matches(content):
	content = normalize_space(content)
	lowercontent = content.lower()
	matches = []
	for prefix in patterns:
		matches = matches + find_pattern_matches(content,lowercontent,prefix)
	return matches
		
def find_pattern_matches(content,lowercontent,prefix):
	start = lowercontent.find(prefix,0)
	matches = []
	while start != -1:
		snip = trim_to_words(content[max(0,start-1000):start+1000])	
		matches.append(snip)		
		start = lowercontent.find(prefix,start+1)
	return matches
	
	
