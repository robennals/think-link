
import hashlib as h
import re
import nlptools as t
import os
import urllib
import urllib2
import time

"""
Create a cache for URLS that we download from elsewhere.
Used by the BOSS code.
"""

downloaded = False

def cache_filename(url):
	hsh = h.md5(url).hexdigest()
	return hsh[0:2]+"/"+hsh[2:4]+"/"+hsh[4:6]+"/"+hsh
	
basedir = "../output/cache/"
	
def get_cached_url(bucket,url,max=None,timeout=None,pause=False):
	global downloaded
	bucketdir = basedir+bucket
	filename = bucketdir+"/"+cache_filename(url)
	if os.path.exists(filename):
		return file(filename)
	else:
		if pause:
			time.sleep(0.25)
			print "fetching url:",url
		if max:
			content = urllib2.urlopen(url,None,timeout).read(max)
		else:
			content = urllib.urlopen(url).read()
		dir = os.path.dirname(filename)
		if not os.path.exists(dir): os.makedirs(dir)
		cachefile = file(filename,"w")
		cachefile.write(content)
		cachefile.close()
		namefile = file(bucketdir+"/names","a")
		namefile.write(url+"\t"+h.md5(url).hexdigest()+"\n")
		namefile.close()
		downloaded = True
		return file(filename)
