#!/usr/bin/env python
# encoding: utf-8

"""
Count how frequent each noun is.
Processes the output from good_nouns.
"""

import fileinput
import operator as op
import nltk
from claimfinder import sorted_freqs

freqs = {}

stopwords = ["s",'"',"way","t","fact","more","day","people","best","something","person"]

def count_nouns(nouns):
	for noun in nouns:
		noun = noun.replace("\t","").replace("\s","").replace("\n","")
		if not (noun in stopwords) and noun.isalpha():
			freqs[noun] = freqs.get(noun,0) + 1


def drop_html(nouns):
	if "<" in nouns:
		return nouns[0:nouns.index("<")]
	else:
		return nouns
	

def main():
	for line in fileinput.input():
		if not ("<" in line): 
			nouns = line.split("\t")[1:]
			count_nouns(nouns)
	freqs = sorted_freqs(freqs)
	for k,v in freqs:
		if(v > 4):
			print k+"\t"+str(v)

if __name__ == '__main__':
	main()
