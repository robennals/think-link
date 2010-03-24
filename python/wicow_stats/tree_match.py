#!/usr/bin/env python
# encoding: utf-8

"""
Load in a list of claims, strip stopwords, structure them into a suffix tree, and then 
look for them in text we get fed.
"""

import nltk

stopwords = set([line.strip() for line in file("stopwords.txt")])

suffixtree = {}

def add_claim_suffix(tree,keywords,fullclaim):
	if len(keywords) < 1: return
	firstword = keywords[0]
	if not firstword in tree: tree[firstword] = ({},[])
	if len(keywords) > 1:
		add_claim_suffix(tree[firstword][0],keywords[1:],fullclaim)
	else:
		tree[firstword][1].append(fullclaim)

def add_claim(claim):
	keywords = [word for word in nltk.word_tokenize(claim.replace("'","")) if not word in stopwords]
	add_claim_suffix(suffixtree,keywords,claim)
	
