import threading
import hashlib
import match
import json
import urlcheck.matcher.basematcher as basematcher

import websearch.compute_rarewords as cr
import websearch.rareword_match as r
import websearch.search_engine as s
from django.shortcuts import render_to_response
from django.http import HttpResponse
from time import sleep
import urlcheck.matcher.allwords_filter as f
import re
import threading
from urlcheck.models import MatchPage,SimpleMatch,url_hash
import claimfilter.trimoptions as t

def to_unicode(bytes):
	"""decode bytes to unicode. Simple try utf-8 and then windows if that fails"""
	if type(bytes).__name__ == "unicode": return bytes
	try:
		return bytes.decode("utf-8")
	except:
		return bytes.decode("cp1252")

def urlcheck_real(url):
	"""Compute matches for a URL and store them in the database."""
	urlobj,created = MatchPage.objects.get_or_create(url=url,
			defaults={'url_hash':url_hash(url),'loading':True})
#	disputes = s.get_raw_disputes(url)
	print "get_raw_disputes:",url
	disputes = [d for d in basematcher.get_raw_disputes(url) if f.is_good(d)]
	disputes = [d for d in disputes if not t.is_bad(to_unicode(d[1]))]
	for dispute in remove_duplicates(disputes):
		disputeobj = SimpleMatch(page=urlobj,
			claimtext=to_unicode(dispute[1]),
			matchcontext=to_unicode("".join(dispute[2])))
		disputeobj.save()
	urlobj.loading = False
	urlobj.save()
	return urlobj.simplematch_set.all()

def urlcheck_get(url,count=0):
	"""Get matches for a URL, either from the database, or by computing now."""
	try:
		urlobj = MatchPage.objects.get(url=url,url_hash=url_hash(url))
		if urlobj.loading and count < 200:
			sleep(0.25)
			return urlcheck_get(url,count+1)
		else:
			return urlobj.simplematch_set.all()
	except MatchPage.DoesNotExist:
		return urlcheck_real(url)
		
def urlcheck_fork(url):
	"""Fork a thread to find matches for the url."""
	try: urlobj = MatchPage.objects.get(url=url,url_hash=url_hash(url))
	except MatchPage.DoesNotExist: 
		thread = UrlCheckThread()
		thread.url = url
		thread.start()					
			
class UrlCheckThread(threading.Thread):
	def run(self):	
		print "preloading url:",self.url
		urlcheck_real(self.url)		


def remove_duplicates(disputes):
	seen = set()
	for dispute in disputes:
		if dispute[1] not in seen:
			seen.add(dispute[1])
			yield dispute
