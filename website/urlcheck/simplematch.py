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


def urlcheck_real(url):
	"""Compute matches for a URL and store them in the database."""
	urlobj,created = MatchPage.objects.get_or_create(url=url,
			defaults={'url_hash':url_hash(url),'loading':True})
#	disputes = s.get_raw_disputes(url)
	print "get_raw_disputes:",url
	disputes = [d for d in basematcher.get_raw_disputes(url) if f.is_good(d)]
	for dispute in remove_duplicates(disputes):
		disputeobj = SimpleMatch(page=urlobj,claimtext=dispute[1],matchcontext="".join(dispute[2]))
		disputeobj.save()
	urlobj.loading = False
	urlobj.save()
	return urlobj.simplematch_set.all()

def urlcheck_get(url,count=0):
	"""Get matches for a URL, either from the database, or by computing now."""
	try:
		urlobj = MatchPage.objects.get(url=url,url_hash=url_hash(url))
		if urlobj.loading and count < 10:
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
