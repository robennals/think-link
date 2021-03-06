#!/usr/bin/env python
# encoding: utf-8

"""
For each claim, compute the two rarest words (using the wikipedia word list).
Use this to index into claims efficiently.

Then apply a more complex algorithm to determine whether one of the found phrases actually matches.
"""

import re
import cPickle 
import old_claims as o
import operator as op
from classify import vector

ignorewords = set(["just","merely","purely","only","simple","were",
		"massive","utter","clearly","the","is","a","the","in",
		"was","wants","giant","","around","all","really","still"])

wikitotalwords = 18312044.0

def load_wiki():
	wikifreq = {}
	for line in file("/home/rob/git/thinklink/wiki_wordfreqs"):
		(word,freq) = line.split(":")
		wikifreq[word] = float(freq)
	return wikifreq
	
# wordfreqs = load_wiki()
def wordfreq(word):
	return vector.word_freqs.get(word.lower(),6)

def wordprob(word):
	return wordfreqs.get(word,2)/wikitotalwords

firstwords = {}
pairs = {}
pair_claims = {}
pair_weights = {}
triple_claims = {}
triple_weights = {}
pair_count = {}

goodword = re.compile("[a-zA-Z]+")

def is_good_word(word): return goodword.match(word)

def claim_words(claim):
	words = good_tokens(claim)
	indexedwords = zip(words,range(0,len(words)))
	scoredwords = [(word.lower(),wordfreq(word),index) for (word,index) in indexedwords if not word in ignorewords]
	scoredwords.sort(key=op.itemgetter(1))
	topwords = scoredwords[:3]
	topwords.sort(key=op.itemgetter(2))
	return [word for (word,freq,index) in topwords]	

# bad_claims = set([line.strip() for line in file("/home/rob/git/thinklink/python/wicow_stats/bad_claims.txt")])

freqlimit = 3100

def add_claim(claim):
	keywords = claim_words(claim)
	if len(keywords) < 2: return
	#if claim in bad_claims: return
	(first,second) = keywords[:2]
	if len(keywords) == 2 and wordfreq(first) > freqlimit and wordfreq(second) > freqlimit: return
	if len(keywords) == 3 and wordfreq(first) > freqlimit and wordfreq(second) > freqlimit and wordfreq(keywords[2]) > freqlimit: return	
	if not first in firstwords: firstwords[first] = set([])
	firstwords[first].add(second)		
	pairkey = first+"-"+second
	if first == second: return
	pair_count[pairkey] = pair_count.get(pairkey,0) + 1
	if len(keywords) == 2:
		if not pairkey in pair_claims: pair_claims[pairkey] = set([])
		pair_claims[pairkey].add(claim)
		pair_weights[pairkey] = (1.0/wordfreq(first)) * (1.0/wordfreq(second))
	else:
		third = keywords[2]
		if third == second: return
		triplekey = first+"-"+second+"-"+third
		if not pairkey in pairs: pairs[pairkey] = set([])
		pairs[pairkey].add(third)
		if not triplekey in triple_claims: triple_claims[triplekey] = set([])
		triple_claims[triplekey].add(claim)
		triple_weights[triplekey] = (1.0/wordfreq(first)) * (1.0/wordfreq(second)) * (1.0/wordfreq(third))

def get_top_pairs():
	return sorted(pair_count.iteritems(),key=op.itemgetter(1),reverse=True)
	
def add_all_claims(path):
	count = 0
	for claim in [line.strip() for line in file(path)]:
		add_claim(claim)
		count += 1
		if count % 5000 == 0:
			print "count",count

def add_old_claims():
	for (phrase,claim) in o.get_old_claims():
		add_claim(phrase.lower())

def tokenize(claim): return [word for word in re.split("\W+",claim) if word != ""]

def good_tokens(claim):
		tokens = tokenize(claim)
		return [word for word in tokens if is_good_word(word)]

def foo():
	print "oy!"

def compute_rarewords():
	add_all_claims("/home/rob/git/thinklink/output/wiki_filtered_claims6.claims")

#	add_all_claims("/home/rob/git/thinklink/output/only_good_claims7.claims")
	
	
def hashset_to_hashlist(hashset):
	return dict([(key,list(hashset[key])) for key in hashset])	
				
			
def json_dump():
	obj = {"firstwords":hashset_to_hashlist(firstwords),
			"pairs":hashset_to_hashlist(pairs),
			"pair_claims":cr.pair_claims,
			"pair_weights":cr.pair_weights,
			"triple_claims":cr.triple_claims,
			"triple_weights":cr.triple_weights}
	return json.dumps(obj)
	
	
	
def dump_to_db_files(basename):
	"""dump to files that can be read into a database"""
	outfile = file(basename+"firstwords_keys.list","w")
	outfile.write("|".join(firstwords.keys()))
	outfile.close()
	outfile = file(basename+"firstwords.csv","w")
	for firstword in firstwords.keys():
		outfile.write(firstword+"\t"+"|".join(firstwords[firstword])+"\n")
	outfile.close()
	outfile = file(basename+"pairs.csv","w")
	for pair in set(pairs.keys() + pair_claims.keys()):
		outfile.write(pair+"\t"+"|".join(pairs.get(pair,[]))+"\t"+
			"|".join(pair_claims.get(pair,[]))+"\n")
	outfile.close()
	outfile = file(basename+"triples.csv","w")
	for triple in triple_claims.keys():
		outfile.write(triple+"\t"+"|".join(triple_claims[triple])+"\n")
	outfile.close()
	
def load_db_data(basename):
	from django.db import connection, transaction
	cursor = connection.cursor()
	cursor.execute("TRUNCATE TABLE urlcheck_firstwords")
	cursor.execute("LOAD DATA LOCAL INFILE %s INTO TABLE urlcheck_firstwords (firstword,secondwords)",[basename+"firstwords.csv"])
	cursor.execute("TRUNCATE TABLE urlcheck_wordpair")
	cursor.execute("LOAD DATA LOCAL INFILE %s INTO TABLE urlcheck_wordpair (pair,triples,claims)",[basename+"pairs.csv"])
	cursor.execute("TRUNCATE TABLE urlcheck_wordtriple")
	cursor.execute("LOAD DATA LOCAL INFILE %s INTO TABLE urlcheck_wordtriple (triple,claims)",[basename+"triples.csv"])
	transaction.commit_unless_managed()
