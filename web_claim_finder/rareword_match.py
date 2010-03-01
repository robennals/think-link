#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, compute the two rarest words (using the wikipedia word list).
Use this to index into claims efficiently.

Then apply a more complex algorithm to determine whether one of the found phrases actually matches.
"""

import nltk
import re
import compute_rarewords as cr
import math
import operator as op

okwords = set(["just","merely","purely","only","simple"])

def tokenize(claim): return re.split("\W+",claim)

def trim_text(words,keyword,claim):
	claimwords = set(tokenize(claim))
	center = words.index(keyword)
	left = center
	right = center
	gap = 0
	pos = center
	while pos >= 0 and gap < 3:
		if words[pos] in claimwords:
			gap = 0
			left = pos
		else:
			gap += 1
		pos -= 1
	gap = 0
	pos = center
	while pos < len(words) and gap < 3:
		if words[pos] in claimwords:
			gap = 0
			right = pos
		else:
			gap += 1
		pos += 1
	return words[left:right+1]		

def text_claim_words(words,claim):
	claimwords = set(tokenize(claim))
	outwords = []
	gap = 0
	for word in words:
		if gap >= 3 or word in ['.','?',';','!']: 
			return outwords[:len(outwords)-gap]
		outwords.append(word)
		if word in claimwords:
			gap = 0
		else:
			gap += 1
	return outwords[:len(outwords)-gap]
	
def word_score(word):
	return (1.0/(cr.wordfreqs.get(word,2)))

def wordset_score(wordset):
	return math.fsum([word_score(word) for word in wordset])

def match_claim(claim,words,first,second):
	claimwords = set(tokenize(claim))
	claimkeywords = claimwords - okwords
	textclaimwords = trim_text(words,first,claim)
	textwords = set(textclaimwords)
	claim_not_text = claimkeywords - textwords
	text_not_claim = textwords - claimwords
	both = claimwords & textwords

#	score = 2*wordset_score(both) - 5*wordset_score(claim_not_text) - wordset_score(text_not_claim)	
	score = 2*wordset_score(both) - len(claim_not_text) - wordset_score(text_not_claim)	

	return (score,claim,textclaimwords,first,second)

def match_with_claims(text):
	words = tokenize(text.lower())
	for i in range(0,len(words)):
		word = words[i]
		if word in cr.firstwords:
			lookingfor = cr.firstwords[word]
			for j in range(i,min(i+20,len(words))):
				if words[j] in lookingfor:
					claims = cr.pairs[word+"-"+words[j]]
					for claim in claims:
						yield match_claim(claim,words[i-20:i+20],word,words[j])

def get_sorted_claims(text):
	matches = match_with_claims(text)
	return sorted(matches,key=op.itemgetter(0),reverse=True)[0:10]				

			
			
			
