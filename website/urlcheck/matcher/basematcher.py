from urlcheck.models import FirstWords, WordPair, WordTriple
import urllib2
import settings
from nlptools.html_to_text import html_to_text
import re

def tokenize(claim): return re.split("(\W+)",claim)
def sentences(text): return text.split(".")





firstwords_keys = set(settings.localfile("data/firstwords_keys.list").read().split("|"))

#TODO: replace caches with limited-size caches that throw away data when they get too big

firstwords_cache = {}
def get_firstwords(first):
	if not first in firstwords_cache:
		try: firstwords_cache[first] = FirstWords.objects.get(firstword=first).secondwords_set()
		except: firstwords_cache[first] = set()
	return firstwords_cache[first]	
		
wordpair_cache = {}
def get_wordpair(pair):
	if not pair in wordpair_cache:
		try:
			pairobj = WordPair.objects.get(pair=pair)
			wordpair_cache[pair] = (pairobj.triples_set(),pairobj.claims_list())
		except:
			wordpair_cache[pair] = (set(),[])
	return wordpair_cache[pair]
	
def get_wordpair_claims(pair): return get_wordpair()[1]
def get_wordpair_triples(pair): return get_wordpair()[0]	

triple_cache = {}
def get_triple_claims(triple):
	if not triple in triple_cache:
		try: triple_cache[triple] = WordTriple.objects.get(triple=triple).claims_list()
		except: triple_cache[triple] = []
	return triple_cache[triple]
		

#def match_claim(claim,words,first,second,freqs):
	#claimwords = set(tokenize(claim))
	#claimkeywords = claimwords - okwords
	#textclaimwords = trim_text(words,first,claim)
	#textwords = set(textclaimwords)
	#claim_not_text = claimkeywords - textwords
	#text_not_claim = textwords - claimwords
	#both = claimwords & textwords

	#if len(claim_not_text) > 0:
		#return (-10,claim,textclaimwords,first,second)

	#score = 2*wordset_score(both,freqs) - wordset_score(text_not_claim,freqs)	

	#return (score,claim,textclaimwords,first,second)

def match_with_claims(text):
	words = tokenize(text)
	for i in range(0,len(words)):
		first = words[i].lower()
		if first in firstwords_keys:
			secondmatch = get_firstwords(first) - set([first])  # hack
			for j in range(i,min(i+10,len(words))):
				second = words[j].lower()
				if second in secondmatch:
					(thirdmatch,pairclaims) = get_wordpair(first+"-"+second)
					thirdmatch = thirdmatch - set([first,second])
					for claim in pairclaims:
						yield ([first,second],claim,words[max(0,i-20):j+20])
					if len(thirdmatch) > 0:
						for k in range(j,min(j+10,len(words))):
							third = words[k].lower()
							if third in thirdmatch: 
								for claim in get_triple_claims(first+"-"+second+"-"+third):
									yield ([first,second,third],claim,words[max(0,i-20):k+20])	
								
def get_raw_disputes(url):
	"""unfiltered and unranked. Return all disputes we find"""
	try:
		htmlcontent = urllib2.urlopen(url,None,2).read(200000)	
		text = html_to_text(htmlcontent)
		return match_with_claims(text)
	except:
		return []
