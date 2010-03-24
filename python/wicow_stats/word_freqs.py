#!/usr/bin/env python
# encoding: utf-8

"""
Count how frequent each word is.
"""

import fileinput
import operator as op
import nltk

freqs = {}

def count_freqs(claim):
	words = nltk.word_tokenize(claim)
	for word in words:
		freqs[word] = freqs.get(word,0) + 1

def sorted_freqs():
	return sorted(freqs.iteritems(),key=op.itemgetter(1),reverse=True)

def main():
	for line in fileinput.input():
		claim = line.split("\t")[1]
		count_freqs(claim)
	freqs = sorted_freqs()
	for k,v in freqs:
		if(v > 4):
			print k+"\t"+str(v)

if __name__ == '__main__':
	main()
