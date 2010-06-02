# Create your views here.

import threading
import hashlib
import match
import json

import websearch.compute_rarewords as cr
import websearch.rareword_match as r
import websearch.search_engine as s
from django.shortcuts import render_to_response
from django.http import HttpResponse
from time import sleep

from urlcheck.models import MatchPage,SimpleMatch,url_hash

def urlcheck(request):
	disputes = urlcheck_get(request.GET["url"])
	rawdata = [{'claimtext':dispute.claimtext} for dispute in disputes]
	return apiresponse(rawdata,request)

#def urlcheck(request):
	#disputes = s.get_raw_disputes(request.GET["url"])
	#processed = [{'claimtext':dispute[1],'matchtext':" ".join(dispute[2])} for dispute in disputes]
	#return apiresponse(processed,request)

def urlcheck_real(url):
	"""Compute matches for a URL and store them in the database."""
	urlobj,created = MatchPage.objects.get_or_create(url=url,
			defaults={'url_hash':url_hash(url),'loading':True})
	disputes = s.get_raw_disputes(url)
	for dispute in disputes:
		disputeobj = SimpleMatch(page=urlobj,claimtext=dispute[1])
		disputeobj.save()
	urlobj.loading = False
	urlobj.save()
	return urlobj.simplematch_set.all()

def urlcheck_get(url,count=0):
	"""Get matches for a URL, either from the database, or by computing now."""
	try:
		urlobj = MatchPage.objects.get(url=url,url_hash=url_hash(url))
		if urlobj.loading and count < 5:
			sleep(1)
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
	
def apiresponse(data,request):
	if "callback" in request.GET:
		return HttpResponse(request.GET["callback"]+"("+json.dumps(data)+")",mimetype="text/javascript")
	else:
		return HttpResponse(json.dumps(data),mimetype="application/json")

