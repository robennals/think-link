#!/usr/bin/env python
# encoding: utf-8

"""
Download several URLs simultaneously.
"""

import urllib2
import threading
import socket
import urllib

socket.setdefaulttimeout(1)

class MapThread(threading.Thread):
	def run(self):
		try:
			self.result = self.func(self.item,self.arg)
		except:
			self.result = None
			
	def do(self,func,item,arg):
		self.item = item
		self.arg = arg
		self.func = func
		self.start()
			
def pmap(func,items,arg):
	map_threads = []
	for item in items:
		t = MapThread()
		t.do(func,item,arg)
		map_threads.append(t)
	results = []
	for t in map_threads:
		t.join()
		results.append(t.result)
	return results
	
def download_url(url,nothing):
	return (url,urllib2.urlopen(url,None,1).read(20000))	
	
def download_urls(urls):
	return pmap(download_url,urls,None)

def download_urls_dict(urls):
	return dict([item for item in download_urls(urls) if item])		

cache = {}

def retrieve_url(url,nothing):
	if url in cache:
		print "cached:",url
		return (url,file(cache[url]).read(20000))
	else:
		print "downloading:",url
		(filename,headers) = urllib.urlretrieve(url)
		cache[url] = filename
		return (url,file(filename).read(20000))
	
def retrieve_urls(urls):
	return pmap(retrieve_url,urls,None)

def retrieve_urls_dict(urls):
	return dict([item for item in retrieve_urls(urls) if item])		
	
		
