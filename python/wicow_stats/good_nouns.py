#!/usr/bin/env python
# encoding: utf-8

"""
Do "drop_bad_claims" and "get_nouns" together in one pass.

We do these two together because POS tagging is needed by both and is
really slow, so by combining them together we can do everything in one pass.
"""

import drop_bad_claims as d
import get_nouns as n
import claimfinder as c
import fileinput
import nltk
import sys


def main():
	for line in fileinput.input():
		claim = line.split("\t")[1].replace("\n","")
		claim = c.convert_entities(claim)
		words = nltk.word_tokenize(claim)
		tagged = nltk.pos_tag(words)		
		trimmed = d.trim_statement_tagged(words,tagged,claim)
		if trimmed:
			nouns = n.get_nouns_tagged(trimmed)
			trimclaim = " ".join([word[0] for word in trimmed])
			sys.stdout.write(trimclaim)
			for noun in nouns:
				sys.stdout.write("\t"+noun)
			sys.stdout.write("\n")

if __name__ == '__main__':
	main()
