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
from claimfilter import trimoptions as t
from classify import features as f
from datetime import datetime
import settings
import pdb


from urlcheck.models import MatchPage,SimpleMatch,url_hash,ClaimContext,MatchVote

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
		contextobj = ClaimContext.objects.filter(claimtext=claimtext)[0]
		text = html_to_text(contextobj.sentence).strip()
		return {'url':contextobj.url, 'text':text, 'prefix': contextobj.prefix, 'date':contextobj.date,
		'badvotes':contextobj.badvotes, 'goodvotes':contextobj.goodvotes}
	except:
		return {'url':'',"text":'','prefix':'','date':'','badvotes':0,'goodvotes':0}

model,range,mapping = f.load_model(settings.localfilename("data/classifier"))

def data_for_dispute(dispute,url):
	sourcecontext = get_dispute_context(dispute.claimtext)
	svmitem = {'claimtext':dispute.claimtext,
			'matchurl':url,'srcurl':sourcecontext['url'],
			'srccontext':sourcecontext['text'],
			'matchcontext':dispute.matchcontext}
	score = f.classify_item(svmitem,model,range,mapping) - sourcecontext['badvotes']/(1+sourcecontext['goodvotes'])
	if dispute.vote == "good":
		score = 1;
	return {
	    'badvotes':sourcecontext['badvotes'],
	    'goodvotes':sourcecontext['goodvotes'],	    
	 	'claimtext':dispute.claimtext,
	 	'matchcontext':dispute.matchcontext,
		'id':dispute.id,
		'score':score,
		#'bad':t.simple_trim(sourcecontext['text']) != dispute.claimtext or t.is_bad(dispute.claimtext),
		'bad':t.is_bad(dispute.claimtext),
		'vote':dispute.vote,
		'pageurl':url,
		'sourceurl':sourcecontext['url'],
		'sourcedomain':get_domain(sourcecontext['url']),
		'sourcecontext':sourcecontext['text'].replace(dispute.claimtext,"<b>"+dispute.claimtext+"</b>"),
		'sourceprefix':sourcecontext['prefix'],
		'displaycontext':make_bold_text(dispute.claimtext,dispute.matchcontext)} 
				

def urlcheck(request):
	print "urlcheck:",request.GET['url']
	disputes = urlcheck_get(request.GET["url"])
	rawdata = [data_for_dispute(dispute,request.GET['url']) for dispute in disputes]
	byscore = sorted(rawdata,key=lambda x:x['score'],reverse=True)
	#rawdata = [{'claimtext':dispute.claimtext,
				#'matchcontext':dispute.matchcontext,
				#'id':dispute.id,
				#'vote':dispute.vote,
				## 'sourcecontext':make_bold_text(dispute.claimtext,get_dispute_context(dispute.claimtext),
				#'displaycontext':make_bold_text(dispute.claimtext,dispute.matchcontext)} 
					#for dispute in disputes]
	return apiresponse(byscore,request)

def get_ip(request):
	if "HTTP_X_FORWARDED_FOR" in request.META:
		return request.META["HTTP_X_FORWARDED_FOR"]
	else:
		return request.META['REMOTE_ADDR']


#TODO: prevent multiple voting? Display previous votes? Store most recent vote in SimpleMatch too?
#TODO: get facebook connect login working for voting?
def vote(request):
	contextobj = ClaimContext.objects.filter(claimtext=request.POST['claimtext'])[0]
	if(request.POST['vote'] == "bad"):
		contextobj.badvotes += 1
		contextobj.save()
	elif(request.POST['vote'] == "good"):
		contextobj.goodvotes += 1 
		contextobj.save()

	#print "setvote:",request.POST['id'],request.POST['vote'],request.POST['claimtext']
	vote = MatchVote(claimtext=request.POST['claimtext'],claimurl=request.POST['sourceurl'],
			claimcontext=request.POST['sourcecontext'],pageurl=request.POST['pageurl'],
			pagecontext=request.POST['matchcontext'],vote=request.POST['vote'],
			voteraddr=get_ip(request),
			pagedate=datetime.strptime(request.POST['date']," %Y/%m/%d"),
			claimdate=contextobj.date,
			votedate=datetime.now())
	vote.save()
	match = SimpleMatch.objects.get(id=request.POST['id'])
	match.vote = request.POST['vote']
	match.save()
	
	return apiresponse("okay",request)

#def vote(request):
	#print "setvote:",request.POST['id'],request.POST['vote'],request.POST['claimtext']
	#match = SimpleMatch.objects.get(id=request.POST['id'])
	#match.vote = request.POST['vote']
	#match.save()
	#return apiresponse("okay",request)


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

			
