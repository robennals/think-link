#!/usr/bin/env python
# encoding: utf-8

"""
We don't want to include "bad claims" that aren't a proper statement about the world.

Examples of bad claims include:
	"without success"  - isn't a statement
	"he did it"  - local context. Uses the word "he"
	
Rules for a good sentence:
	Contains no words tagged PRP - e.g. he,she,it,him
	Contains either a noun and an adjective (e.g. mars is big) 
		or two nouns (e.g. george bush hates dinosaurs)	
		
Possible extensions:
	Also disallow PRP$?  - his, her, their etc
"""

import fileinput
import nltk

def is_statement(claim):
	taggedwords = tag_claim(claim)
	tags = [tword[1] for tword in taggedwords]
	noun1 = False
	gap = False
	thing2 = False
	for tag in tags:
		if tag=="PRP":
			 return False
		if tag.startswith("NN") and not noun1:
			noun1 = True
		if not tag.startswith("NN") and noun1 and  not gap:
			gap = True
		if (tag.startswith("NN") or tag.startswith("JJ")) and gap:
			return True
	return False
	
def tag_claim(claim):
	return nltk.pos_tag(nltk.word_tokenize(claim))
	
def main():
	for line in fileinput.input():
		claim = line.split("\t")[1]
		if is_statement(claim):
			print line,

if __name__ == '__main__':
	main()
