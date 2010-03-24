#!/usr/bin/env python
# encoding: utf-8

"""
Do TF/IDF for word frequencies, using Wikipedia as a baseline

The motivation for this is to discover what words are more likely
to be mentioned as disputed, than in normal life.

Most words is a disputed claim are fairly mundane and aren't so interesting
to extract.
"""

from __future__ import print_function
import fileinput
import operator as op
import nltk

wikifreq = {}

def load_wiki():
	for line in file("/home/rob/git/thinklink/wiki_wordfreqs"):
		(word,freq) = line.split(":")
		wikifreq[word] = float(freq)
		
fixedfreq = {}		
		
def sorted_freqs():
	return sorted(fixedfreq.iteritems(),key=op.itemgetter(1),reverse=True)		
		
def main():
	load_wiki()
	for line in fileinput.input():
		(word,freq) = line.split("\t")
		fixedfreq[word] = float(freq)/wikifreq.get(word,2)	
	freqs = sorted_freqs()
	for k,v in freqs:
		if(v > 4):
			print(k,v,sep="\t")

if __name__ == '__main__':
	main()
