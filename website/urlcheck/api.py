# Create your views here.

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
from urlcheck.simplematch import urlcheck_get
from nlptools.html_to_text import html_to_text
from nlptools import trim_to_words
from wicow_stats import filter_claims
from nlptools import get_domain

from urlcheck.models import MatchPage,SimpleMatch,url_hash,SimpleContext

# TODO: cleanup is a hang-over from the old methods
def trim_string(context,claimtext):
	context = messy_cleanup(context)
	pos = context.find(claimtext)	
	shrunken = context[max(0,pos-100):min(pos+100,len(context))]
	return trim_to_words(shrunken)

def messy_cleanup(text):
	text = text.replace(" '"," ").replace("' "," ").replace('"',"").replace("[","").replace("]","").replace("(","").replace(")","")
	text = text.replace("-"," ").replace("/"," ")
	return text
	

def get_dispute_context(claimtext):
	try:
		contextobj = SimpleContext.objects.get(claimtext=claimtext)
		text = html_to_text(contextobj.context)
		text = trim_string(text,claimtext)
		title = trim_to_words(contextobj.pagetitle[:60])
		return {'title':title, 'url':contextobj.url, 'text':text}
	except SimpleContext.DoesNotExist:
		return {'title':"",'url':'',"text":''}

def data_for_dispute(dispute):
	sourcecontext = get_dispute_context(dispute.claimtext)
	return {
	 	'claimtext':dispute.claimtext,
	 	'matchcontext':dispute.matchcontext,
		'id':dispute.id,
		'vote':dispute.vote,
		'sourceurl':sourcecontext['url'],
		'sourcetitle':sourcecontext['title'],
		'sourcedomain':get_domain(sourcecontext['url']),
		'sourcecontext':sourcecontext['text'].replace(dispute.claimtext,"<b>"+dispute.claimtext+"</b>"),
		'displaycontext':make_bold_text(dispute.claimtext,dispute.matchcontext)} 
				

def urlcheck(request):
	print "urlcheck:",request.GET['url']
	disputes = urlcheck_get(request.GET["url"])
	rawdata = [data_for_dispute(dispute) for dispute in disputes]
	#rawdata = [{'claimtext':dispute.claimtext,
				#'matchcontext':dispute.matchcontext,
				#'id':dispute.id,
				#'vote':dispute.vote,
				## 'sourcecontext':make_bold_text(dispute.claimtext,get_dispute_context(dispute.claimtext),
				#'displaycontext':make_bold_text(dispute.claimtext,dispute.matchcontext)} 
					#for dispute in disputes]
	return apiresponse(rawdata,request)

def vote(request):
	print "setvote:",request.POST['id'],request.POST['vote'],request.POST['claimtext']
	match = SimpleMatch.objects.get(id=request.POST['id'])
	match.vote = request.POST['vote']
	match.save()
	return apiresponse("okay",request)


def make_bold_text(claimtext,matchtext):
	claimwords = re.split("[\s.!?;:,=\-/\"\']",claimtext.lower())
	matchwords = re.split("([\s.!?;:,=\-/\"\'])",matchtext)
	newtext = ""
	for word in matchwords:
		if word.lower() in claimwords:
			newtext += "<b>"+word+"</b>"
		else:
			newtext += word
	return newtext

def apiresponse(data,request):
	if "callback" in request.GET:
		return HttpResponse(request.GET["callback"]+"("+json.dumps(data)+")",mimetype="text/javascript")
	else:
		return HttpResponse(json.dumps(data),mimetype="application/json")

			
