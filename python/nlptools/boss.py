from urllib import quote_plus, urlopen
from nlptools.xmltools import XML
import nlptools as t
import nlptools.urlcache as uc
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
	dom = XML(uc.get_cached_url("boss",url,pause=True))
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
			
