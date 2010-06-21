#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, compute the two rarest words (using the wikipedia word list).
Use this to index into claims efficiently.

Then apply a more complex algorithm to determine whether one of the found phrases actually matches.
"""

import re
import compute_rarewords as cr
import math
import operator as op

# from compute_rarewords import stopwords

okwords = set(["just","merely","purely","only","simple","were",
		"massive","utter","clearly","the","is","a","the","in","do",
		"was","wants","giant","","around","all","really","still","not","doesn't","isn't"])


def tokenize(claim): return re.split("\W+",claim)
def sentences(text): return text.split(".")

def trim_text(words,keyword,claim,maxgap = 3):
	claimwords = set(tokenize(claim))
	center = words.index(keyword)
	left = center
	right = center
	gap = 0
	pos = center
	while pos >= 0 and gap < maxgap:
		if words[pos] in claimwords:
			gap = 0
			left = pos
		else:
			gap += 1
		pos -= 1
	gap = 0
	pos = center
	while pos < len(words) and gap < maxgap:
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
	
def word_score(word,freqs):
	return (freqs[word]/(cr.wordfreqs.get(word,2)))

def my_fsum(nums):
	out = 0.0
	for num in nums:
		out += num
	return out

def wordset_score(wordset,freqs):
	return my_fsum([word_score(word,freqs) for word in wordset])

#	return math.fsum([word_score(word,freqs) for word in wordset])

def match_claim(claim,words,first,second,freqs):
	claimwords = set(tokenize(claim))
	claimkeywords = claimwords - okwords
	textclaimwords = trim_text(words,first,claim)
	textwords = set(textclaimwords)
	claim_not_text = claimkeywords - textwords
	text_not_claim = textwords - claimwords
	both = claimwords & textwords

	if len(claim_not_text) > 0:
		return (-10,claim,textclaimwords,first,second)

#	score = 2*wordset_score(both) - 5*wordset_score(claim_not_text) - wordset_score(text_not_claim)	
	score = 2*wordset_score(both,freqs) - wordset_score(text_not_claim,freqs)	

	return (score,claim,textclaimwords,first,second)

def match_with_claims(text):
	freqs = count_word_freqs(text)
	words = tokenize(text.lower())
	for i in range(0,len(words)):
		first = words[i]
		if first in cr.firstwords:
			secondmatch = cr.firstwords[first]
			for j in range(i,min(i+5,len(words))):
				second = words[j]
				if second in secondmatch:
					if first+"-"+second in cr.pair_claims:
						for claim in cr.pair_claims[first+"-"+second]:
							yield match_claim(claim,words[max(0,i-5):j+5],first,second,freqs)
					if first+"-"+second in cr.pairs:
						thirdmatch = cr.pairs[first+"-"+second]
						for k in range(j,min(j+5,len(words))):
							third = words[k]
							if third in thirdmatch: 
								for claim in cr.triple_claims[first+"-"+second+"-"+third]:
									yield match_claim(claim,words[max(0,i-10):k+10],first,second,freqs)	
								

def match_with_claims_old(text):
	words = tokenize(text.lower())
	for i in range(0,len(words)):
		word = words[i]
		if word in cr.firstwords:
			lookingfor = cr.firstwords[word]
			for j in range(i,min(i+20,len(words))):
				if words[j] in lookingfor:
					claims = cr.pairs[word+"-"+words[j]]
					for claim in claims:
						yield match_claim(claim,words[max(0,i-20):i+20],word,words[j])

def count_pair_freqs(text,paircounts={}):
	words = tokenize(text.lower())
	for i in range(0,len(words)):
		word = words[i]
		if word in cr.firstwords:
			lookingfor = cr.firstwords[word]
			for j in range(i,min(i+20,len(words))):
				if words[j] in lookingfor:
					paircounts[(word,words[j])] = paircounts.get((word,words[j]),0) + 1
	return paircounts

def count_word_freqs(text,wordcounts={}):
	words = tokenize(text.lower())
	for word in words:
		wordcounts[word] = wordcounts.get(word,0) + 1
	return wordcounts

# trainable variables
param_pairweight = 4.0
param_wordweight = 1.0


# we weight the importance using a combinaton of the TF/IDF of the pair
# and the TF/IDF of the ords in the pair
# TODO: train these weights
def pair_score(pair,paircounts,wordcounts):
	(x,y) = pair
	return (
		(param_pairweight * paircounts[pair]/cr.pair_weights[x+"-"+y])
		+ (param_wordweight * wordcounts[x]/cr.wordfreqs.get(x,2))
		+ (param_wordweight * wordcounts[y]/cr.wordfreqs.get(y,2))) 

def sorted_pairs(pairs,paircounts,wordcounts):
	pairs.sort(cmp=lambda x,y: cmp(
		pair_score(x,paircounts,wordcounts),
		pair_score(y,paircounts,wordcounts)))
	return pairs

def get_sorted_claims(text):
	matches = match_with_claims(text)
	return sorted(matches,key=op.itemgetter(0),reverse=True)[0:10]				

			
			
			
