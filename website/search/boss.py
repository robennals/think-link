
from secret import bossKey
from urllib import quote_plus, urlopen
from nlptools.xmltools import XML

def get_boss_url(query,start=0,count=10):
	bossSvr = "http://boss.yahooapis.com/ysearch/web/v1"
	url = (bossSvr + "/" + quote_plus(query) + "?appid="+bossKey+
			"&format=xml"+"&start="+str(start)+"&count="+str(count)+
			"&abstract=long")
	return url

def get_boss(query,page=0):
	url = get_boss_url(query,page*10,10)
	dom = XML(urlopen(url))
	return dom.findAll("result")
