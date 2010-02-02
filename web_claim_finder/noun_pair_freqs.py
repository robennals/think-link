#!/usr/bin/env python
# encoding: utf-8

"""
Count the frequency of each noun that co-occurs with a key noun, but 
which is not part of the same noun-phrase as that noun.

We want nouns that seem to have a subject-verb-object relationship with
they keynoun. 
"""

import fileinput
import operator as op
import nltk
import sys

freqs = {}

stopwords = ["s",'"',"way","t","fact","more","day","people","best","something","person"]

def count_nouns(nouns):
	for noun in nouns:
		noun = noun.replace("\t","").replace("\s","").replace("\n","")
		if not (noun in stopwords) and noun.isalpha():
			freqs[noun] = freqs.get(noun,0) + 1

def sorted_freqs():
	return sorted(freqs.iteritems(),key=op.itemgetter(1),reverse=True)

def drop_html(nouns):
	if "<" in nouns:
		return nouns[0:nouns.index("<")]
	else:
		return nouns
	
def contains_badword(phrase,badwords):
	for badword in badwords:
		if badword in phrase: return True
	return False	

def main(args):
	keynoun = args[1]
	infile = args[2]
	for line in file(infile):
		if not ("<" in line) and keynoun in line: 
			nouns = set(line.split("\t")[1:])			
			badwords = set()
			for noun in nouns:
				if keynoun in noun:
					badwords = badwords.union(noun.split(" "))
			nouns = [noun for noun in nouns if not contains_badword(noun,badwords)]
			count_nouns(nouns)				
	freqs = sorted_freqs()
	for k,v in freqs:
		if(v > 4):
			print k+"\t"+str(v)

if __name__ == '__main__':
	main(sys.argv)
