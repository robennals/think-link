#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, compute the two rarest words (using the wikipedia word list).
Use this to index into claims efficiently.

Then apply a more complex algorithm to determine whether one of the found phrases actually matches.
"""

import nltk
import re
import cPickle 
import old_claims as o
import operator as op

ignorewords = set(["just","merely","purely","only","simple","were",
		"massive","utter","clearly","the","is","a","the","in",
		"was","wants","giant","","around","all","really","still"])

wikitotalwords = 18312044.0

def load_wiki():
	wikifreq = {}
	for line in file("/home/rob/git/thinklink/wiki_wordfreqs"):
		(word,freq) = line.split(":")
		wikifreq[word] = float(freq)
	return wikifreq
	
wordfreqs = load_wiki()

def wordprob(word):
	return wordfreqs.get(word,2)/wikitotalwords

firstwords = {}
pairs = {}
pair_claims = {}
pair_weights = {}
triple_claims = {}
triple_weights = {}

goodword = re.compile("[a-zA-Z]+")

def is_good_word(word): return goodword.match(word)

def claim_words(claim):
	words = good_tokens(claim)
	indexedwords = zip(words,range(0,len(words)))
	scoredwords = [(word,wordfreqs.get(word,2),index) for (word,index) in indexedwords if not word in ignorewords]
	scoredwords.sort(key=op.itemgetter(1))
	topwords = scoredwords[:3]
	topwords.sort(key=op.itemgetter(2))
	return [word for (word,freq,index) in topwords]	

bad_claims = set([line.strip() for line in file("../web_claim_finder/bad_claims.txt")])

def add_claim(claim):
	keywords = claim_words(claim)
	if len(keywords) < 2: return
	if claim in bad_claims: return
	(first,second) = keywords[:2]
	if not first in firstwords: firstwords[first] = set([])
	firstwords[first].add(second)		
	pairkey = first+"-"+second
	if first == second: return
	if len(keywords) == 2:
		if not pairkey in pair_claims: pair_claims[pairkey] = []
		pair_claims[pairkey].append(claim)
		pair_weights[pairkey] = (1.0/wordfreqs.get(first,2)) * (1.0/wordfreqs.get(second,2))
	else:
		third = keywords[2]
		if third == second: return
		triplekey = first+"-"+second+"-"+third
		if not pairkey in pairs: pairs[pairkey] = set([])
		pairs[pairkey].add(third)
		if not triplekey in triple_claims: triple_claims[triplekey] = []
		triple_claims[triplekey].append(claim)
		triple_weights[triplekey] = (1.0/wordfreqs.get(first,2)) * (1.0/wordfreqs.get(second,2)) * (1.0/wordfreqs.get(third,2))

def add_claim_old(claim):
	words = good_tokens(claim)
	if len(words) < 3: return
	first = words[0]
	firstfreq = wordfreqs.get(first,2)
	second = words[1]
	secondfreq = wordfreqs.get(second,2)
	for word in words[2:]:
		freq = wordfreqs.get(word,2)
		if (freq < firstfreq or freq < secondfreq) and word != first and word != second:
			if secondfreq < firstfreq:
				first = second
				firstfreq = secondfreq				
			second = word
			secondfreq = freq	
	if first == '' or second == '': return
	if not first in firstwords: firstwords[first] = set([])
	firstwords[first].add(second)
	pairkey = first+"-"+second
	if not (pairkey) in pairs: 
		pairs[pairkey] = []
		pair_weights[pairkey] = (1.0/firstfreq) * (1.0/secondfreq)
	pairs[pairkey].append(claim)
	
def add_all_claims(path):
	count = 0
	for claim in [line.strip() for line in file(path)]:
		add_claim(claim)
		count += 1
		if count % 5000 == 0:
			print "count",count

def add_old_claims():
	for (phrase,claim) in o.get_old_claims():
		add_claim(phrase.lower())

def tokenize(claim): return [word for word in re.split("\W+",claim) if word != ""]

def good_tokens(claim):
		tokens = tokenize(claim)
		return [word for word in tokens if is_good_word(word)]

def foo():
	print "oy!"

def compute_rarewords():
	add_all_claims("/home/rob/git/thinklink/output/only_good_claims7.claims")
	
def create_rarewords_pickle():
	add_all_claims("/home/rob/git/thinklink/output/only_good_claims7.claims")
	cPickle.dump((wordfreqs,firstwords,pairs,pair_claims,pair_weights,triple_claims,triple_weights),open("indexedclaims.pkl","w"),True)
	
def load_rarewords_pickle():
	global wordfreqs
	global firstwords
	global pairs
	global pair_weights
	print "loading rarewords from pickle..."
	(wordfreqs,firstwords,pairs,pair_weights) = cPickle.load(file("indexedclaims.pkl"))
			
			
			
