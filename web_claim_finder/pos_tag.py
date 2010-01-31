#!/usr/bin/env python
# encoding: utf-8

"""
Do part-of-speech tagging on each claim, and save the result in a pickle.

The main reason for the existance of this pass, is that pos tagging is the slowest part
of deciding whether a claim is good, so, by isolating this stage, we can
iteratively refine our goodness algorithm, without having to re-run it on all the data
every time.

As another little feature, we do POS tagging on the .claims files, rather than on a directory.

Right now, the algorithm is pretty hacky about HTML and just chops off everything 
after the first "<" character. It would be nice to do this better.

"""

import fileinput
import nltk
import claimfinder as c
import pickle
import sys

def main():
	claims = []
	for line in fileinput.input():
		if not ("<" in line): 
			claim = line.split("\t")[1]
			claim = c.convert_entities(claim)
			words = nltk.word_tokenize(claim)
			taggedwords = nltk.pos_tag(words)
			claims.append((claim,taggedwords))
	pickle.dump(claims,sys.stdout)

if __name__ == '__main__':
	main()
