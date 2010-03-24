"""
Given a claim, or list of claims, find a big list of places on the web where
this text appears.
If we do this for several claims, then we can use this to identify patterns.
"""

import nlptools.boss as boss
from nlptools.html_to_text import html_to_text
from nlptools import normalize_space, normalize_text
import nlptools as t

def contexts_for_claim(claim):
	results = boss.get_boss_cached('"'+claim+'"')
	prefixes = get_prefixes(results,claim)
	add_prefixes(prefixes)
	return rank_prefixes()
	
def get_abstracts(results,claim):
	return [html_to_text(result["abstract"]) for result in results]
	
def get_prefixes(results,claim):
	abstracts = [html_to_text(result["abstract"]) for result in results]
	prefixes = [prefix_for_claim(abstract,claim) for abstract in abstracts]
	return [prefix for prefix in prefixes if prefix]

def prefix_for_claim(text,claim):
	text = normalize_space(text)
	claim = normalize_space(claim)
	ltext = text.lower()
	start = ltext.find(claim.lower())
	if start > 0:
		return text[:start]
	return None

def add_prefixes(prefixes):
	for prefix in prefixes: add_prefix(prefix)
	
prefix_counts = {}
def add_prefix(prefix):
	subs = t.suffixes(normalize_text(prefix).split(" "))
	for sub in subs:
		stxt = " ".join(sub)
		prefix_counts[stxt] = prefix_counts.get(stxt,0) + 1
	
def find_pattern_matches(content,lowercontent,prefix):
	start = lowercontent.find(prefix,0)
	matches = []
	while start != -1:
		snip = trim_to_words(content[max(0,start-1000):start+1000])	
		matches.append(snip)		
		start = lowercontent.find(prefix,start+1)
	return matches

def prefix_score(iteritem):
	(prefix,count) = iteritem
	wordcount = len(t.words(prefix))
	return count
	
def rank_prefixes():
	return sorted(prefix_counts.iteritems(),key=prefix_score,reverse=True)
			

testclaims = [
	"the great wall of china is visible from space",
	"global warming does not exist",
	"vaccines cause autism",
	"the earth is getting cooler",
	"obama was born in Kenya",
	"obama is not a us citizen"
	]
