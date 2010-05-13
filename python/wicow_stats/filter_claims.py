#!/usr/bin/env python
# encoding: utf-8

"""
New hand-coded attempt at writing a filter function that gives us high-quality claims.
"""

import nltk
import sys
import fileinput

import claimfinder as cf

def getclaim(line):
	return line.split("\t")[2]

def cleanup(claim):
	claim = cf.convert_entities(claim)
	claim = cf.convert_unicode(claim)
	claim = trim_claim_start(claim)
	claim = trim_claim_end(claim)
	claim = claim.replace(" '"," ").replace("' "," ").replace('"',"").replace("[","").replace("]","").replace("(","").replace(")","")
	claim = claim.replace("-"," ").replace("/"," ")
	return claim

def trim_claim_start(claim):
	if len(claim) > 0 and claim[0] in ["'"," ",",","."] :
		return trim_claim_start(claim[1:])
	else: return claim

def trim_claim_end(claim):
	for endstring in endstrings:
		if endstring in claim: claim = claim[:claim.find(endstring)]
	for breakword in breakwords:
		if (" "+breakword+" ") in claim: claim = claim[:claim.find(" "+breakword+" ")]
		if (breakword+",") in claim: claim = claim[:claim.find(" "+breakword+",")]	
	for commaword in commawords:
		if (", "+commaword) in claim: claim = claim[:claim.find(", "+commaword)]
		if ("' "+commaword) in claim: claim = claim[:claim.find("' "+commaword)]
	return claim

bad_claims = set([line.strip() for line in file("/home/rob/git/thinklink/python/wicow_stats/bad_claims.txt")])
bad_claims_auto = set([line.strip() for line in file("/home/rob/git/thinklink/python/wicow_stats/bad_claims_auto.txt")])

def is_good(claim):
	words = nltk.word_tokenize(claim)
	if len(words) < 3: return False
	if words[0] in badfirstwords: return False
	if words[-1] in badlastwords: return False
	if not badwords.isdisjoint(words): return False
	if has_bad_string(claim): return False
	if has_bad_prefix(claim): return False
	if has_bad_end(claim): return False
	if claim in bad_claims: return False
	if claim in bad_claims_auto: return False
	if not claim[0].isalpha(): return False
	return True

def has_bad_prefix(claim):
	for badprefix in badprefixes:
		if claim.startswith(badprefix): return True
	return False

def has_bad_string(claim):
	for badstring in badstrings:
		if badstring in claim: return True
	return False
	
def has_bad_end(claim):
	for badend in badends:
		if claim.endswith(badend): return True
	return False

endstrings = ["?","!",";",":",
		", a",
		" - ","is not only wrong","is utterly","was disproved","was debunked",
		"is clearly", "is false","when in fact","has been repeated","did you ever think",
		"is bunk","is not correct","is not true","and that",",\""]
	
breakwords = ["and that"] # ["and","or","despite","but","however","stating"]
commawords = ["another","just","becoming","when","and","or","despite",
		"but","however","even","have","that","it","often","which",
		"thereby","stating","unaware","thus"]	
	
badfirstwords = set(["'s","our","it","its","they","their","her","his","this","i","she","he","you","your","these","my","i'm",
		"ate","begat","blew","won't","is","just","really",
		".",",","s","but",
		"started","can","caused","changed","concealed","destroyed","gets","goes","grew","fooled",
		"has","helps","have","hurts","is","keeps","knows","launched","lays","leads","made","makes",
		"proves","puts","put","reveals","s","says","tells","told","was","will","wo","would","are","have",
		"annually","allowed","actually","accompanied","became","had","helped"])
		
badlastwords = set(["is","it","was","will","has","might","are","is","1","a","no","his","hers","a","u","that","the","were"])	
badends = ["'s"]
		
badprefixes = ["just won't","the bill","all this","all of it","all of these"]
badstrings = ["are right","<",">","title=","src=","title=","src=","|","width=","cid=","href","trackback","comments feed","--","("," /"]
bad_a_word = ["product","phone","mail"]

badwords = set(["their","theirs","them"])	

credits = ["are stupid","are insane","are beyond contempt"]

def remove_duplicates(claims):
	claims.sort()
	unique = []
	for i in range(0,len(claims)-1):
		if not claims[i+1].startswith(claims[i]):
			unique.append(claims[i])
	return unique

def filter_claims(claims):
	clean = [cleanup(claim) for claim in claims]
	good = [claim for claim in clean if is_good(claim)]
	unique = remove_duplicates(good)
	return unique
	
def matching_claims(claims,str):
	return [claim for claim in claims if str in claim]

def main():
	claims = [getclaim(line) for line in fileinput.input()]
	good = filter_claims(claims)
	for claim in good:
		print claim
			
	
if __name__ == '__main__':
	main()
