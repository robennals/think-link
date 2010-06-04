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

from urlcheck.models import MatchPage,SimpleMatch,url_hash,SimpleContext

def get_dispute_context(claimtext):
	try:
		contextobj = SimpleContext.objects.get(claimtext=claimtext)
		text = html_to_text(contextobj.context)
		return {'title':contextobj.pagetitle, 'url':contextobj.url, 'text':text}
	except:
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
		'sourcecontext':make_bold_text(dispute.claimtext,sourcecontext['text']),
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

			
