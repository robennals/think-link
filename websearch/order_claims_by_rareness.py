

import fileinput

from compute_rarewords import wordfreqs, is_good_word, tokenize, wordprob
from rareword_match import okwords
import math

def claim_rareness(claim):
	tokens = tokenize(claim)
	words = [token for token in tokens if is_good_word(token) and not token in okwords]
	return math.fsum([math.log(wordprob(word)) for word in words]) 

def main():
	claims = [line.strip().lower() for line in fileinput.input()]
	claims.sort(key=claim_rareness, reverse=True)
	for claim in claims:
		print claim
			
	
if __name__ == '__main__':
	main()
