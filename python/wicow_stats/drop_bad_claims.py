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
import claimfinder as c

split_words = set(["despite","although","however",",",";","but","-","--"])

def trim_statement_tagged(words,taggedwords,claim):
	tags = [tword[1] for tword in taggedwords]
	noun1 = False
	verb = False
#	gap = False
	thing2 = False
	good = False
	i = 0
	for tag in tags:
		if (tag=="PRP" or tag == "PRP$") and not noun1:
			 return False
		if tag.startswith("NN") and not noun1:
			noun1 = True
		if tag.startswith("VB") and noun1:
			verb = True
#		if not tag.startswith("NN") and noun1 and  not gap:
#			gap = True
		if (tag.startswith("NN") or tag.startswith("JJ") or tag == "VBG") and verb:
			good = True
		if good and words[i] in split_words:
			return taggedwords[0:i]
		i+=1	
	if good: return taggedwords
	else: return False


def trim_statement(claim):
	claim = c.convert_entities(claim)
	words = nltk.word_tokenize(claim)
	taggedwords = nltk.pos_tag(words)
	trimtagged = trim_statement_tagged(words,taggedwords,claim)
	if trimtagged:
		return " ".join([word[0] for word in trimtagged])
	else: return False
		
	

def is_statement(claim):
	taggedwords = tag_claim(claim)
	tags = [tword[1] for tword in taggedwords]
	noun1 = False
	gap = False
	thing2 = False
	for tag in tags:
		if tag=="PRP":
			 return null
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
		trimmed = trim_statement(claim)
		if trimmed:
			print trimmed

if __name__ == '__main__':
	main()
