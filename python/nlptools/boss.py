from urllib import quote_plus, urlopen
from nlptools.xmltools import XML
import nlptools as t
import os
import pickle

from secret import bossKey

def get_boss_url(query,start=0,count=10):
	bossSvr = "http://boss.yahooapis.com/ysearch/web/v1"
	url = (bossSvr + "/" + quote_plus(query) + "?appid="+bossKey+
			"&format=xml"+"&start="+str(start)+"&count="+str(count)+
			"&abstract=long")
	return url

def get_boss(query,start=0,count=10):
	url = get_boss_url(query,start,count)
	dom = XML(urlopen(url))
	realstart = dom.find("resultset_web").attr("start")
	if int(realstart) == start:
		return dom.findAll("result")
	else:
		return None
	
def get_boss_all(query):
	allresults = []
	for i in range(0,20):
		results = get_boss(query,start=i*50,count=50)
		if results:
			allresults = allresults + results
		else:
			break
	return allresults	
		
def query_to_filename(query):
	return "../output/boss/"+t.string_to_filename(query)+".pkl"
			
def get_boss_cached(query):
	filename = query_to_filename(query)
	if os.path.exists(filename):
		print "loading from cache"
		return pickle.load(file(filename))
	else:
		obj = get_boss_all(query)
		pickle.dump(obj,file(filename,"w"))
		return obj
			
