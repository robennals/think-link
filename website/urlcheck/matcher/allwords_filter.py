
from websearch.rareword_match import okwords, trim_text, word_score, my_fsum, tokenize

def is_good(dispute):
	keywords,claim,matchwords = dispute
	claimwords = set(tokenize(claim.lower()))
	claimkeywords = claimwords - okwords
	textwords = set([word.lower() for word in matchwords])
	claim_not_text = claimkeywords - textwords
	return len(claim_not_text) == 0
			
