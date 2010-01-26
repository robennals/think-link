#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, spit out all possible noun-phrase varients, separated 
by tabs.

input lines are of the format:
	<domain>\t<claim>
	
output lines are:
	list of nouns, separated by tab
	
Since nouns are often abreviated by missing out parts, we accept all
sub-strings of a noun phrase as a valid noun.
E.g.

"Barack Obama" -> barack obama, barack, obama
"high protein intake causes damage" -> lots - since all words are possible nouns

Algorithm is divide and conquer:
	  The full noun phrase
	+ Every shorter form, starting from the front
	+ Apply the algorithm to the tail
"""

import fileinput
import nltk
import sys
import claimfinder as cf

grammar = "NP: {<JJ.*>*<NN.*>*}"
cp = nltk.RegexpParser(grammar)

def sublists(list):
	out = []
	if len(list) == 0: return []
	else: 
		for i in range (1,len(list)+1):
			out.append(list[0:i])		
		return out + sublists(list[1:])

def subnouns(nounphrase):
	words = [word for word in nounphrase.flatten()]
	subseqs = sublists(words)
	nojj = [[w[0] for w in s] for s in subseqs if s[len(s)-1][1] != "JJ"] 
	subnouns = [" ".join(subseq) for subseq in nojj]
	return subnouns

#def subnouns(nounphrase):
	#words = [tagword[0] for tagword in nounphrase.flatten()]
	#subseqs = sublists(words)
	#if(nounphrase.flatten()[1] == "JJ"):
		#subseqs 
	#subnouns = [" ".join(subseq) for subseq in subseqs]
	#return subnouns
	
def get_nouns(claim):
	tree = cp.parse(cf.tag_claim(claim))
	nouns = [subnouns(subtree) for subtree in tree.subtrees() if subtree.node == "NP"]		
	return reduce(list.__add__,nouns)
	
def main():
	for line in fileinput.input():
		claim = line.split("\t")[1]
		nouns = get_nouns(claim)
		for noun in nouns:
			sys.stdout.write("\t"+noun)
		sys.stdout.write("\n")

if __name__ == '__main__':
	main()
