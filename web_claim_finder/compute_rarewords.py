#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, compute the two rarest words (using the wikipedia word list).
Use this to index into claims efficiently.

Then apply a more complex algorithm to determine whether one of the found phrases actually matches.
"""

import nltk
import re

def load_wiki():
	wikifreq = {}
	for line in file("/home/rob/git/thinklink/wiki_wordfreqs"):
		(word,freq) = line.split(":")
		wikifreq[word] = float(freq)
	return wikifreq

wordfreqs = load_wiki()

firstwords = {}
pairs = {}

def add_claim(claim):
	words = tokenize(claim)
	first = words[0]
	firstfreq = wordfreqs.get(first,0)
	second = words[1]
	secondfreq = wordfreqs.get(second,0)
	for word in words[2:]:
		freq = wordfreqs.get(word,0)
		if freq < firstfreq or freq < secondfreq:
			if secondfreq < firstfreq:
				first = second
				firstfreq = secondfreq				
			second = word
			secondfreq = freq	
	if not first in firstwords: firstwords[first] = set([])
	firstwords[first].add(second)
	pairkey = first+"-"+second
	if not (pairkey) in pairs: pairs[pairkey] = []
	pairs[pairkey].append(claim)
	
def add_all_claims(path):
	count = 0
	for claim in [line.strip() for line in file(path)]:
		add_claim(claim)
		count += 1
		if count % 1000 == 0:
			print "count",count

def tokenize(claim): return re.split("\W+",claim)


			
			
			
