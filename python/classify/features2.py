
from makedb.makedb import unescape
from websearch.rareword_match import tokenize
from nlptools.urlcache import get_cached_url
from nlptools.html_to_text import html_to_segments, html_to_text
from nlptools import trim_to_words
import websearch.rareword_match as rm
import websearch.compute_rarewords as cr
import math
from vector import text_similarity
import nltk

def load_data_features(filename):
	for line in file(filename):
		cols = [unescape(col) for col in line.strip('\n').split("\t")] 
		claimtext,vote,matchurl,srcurl,srccontext,matchcontext,srctitle = cols
		item = {'claimtext':claimtext,'vote':vote,'matchurl':matchurl,
			'srcurl':srcurl,'srccontext':srccontext,
			'matchcontext':matchcontext,'srctitle':srctitle}
		yield item

def add_shared_props(item):
	item['matchwords'] = get_trimmed_match(item)	
	item['trimmedmatch'] = " ".join(item['matchwords'])			
	item['claimwords'] = tokenize(item['claimtext'])

def with_prefix(prefix,s):
	return dict.fromkeys(set([prefix + "-" + name for name in s]),1)
	
def add_set_features(features,prefix,set):
	setitems = [prefix + name for name in set]
	features.update(dict.fromkeys(setitems,1))

def features_for_item(item):
	add_shared_props(item)
	features = {}
	features['contextsim'] = context_similarity(item)
	features['claimcontextsim'] = claim_context_similarity(item)
	features['claimtrimsim'] = claim_trim_similarity(item)
	features['extramatchwords'] = extra_match_words(item)
	features['extraclaimwords'] = extra_claim_words(item)
	features['extramatchchars'] = extra_match_chars(item)
	features['extraclaimchars'] = extra_claim_chars(item)
	features['bigramsim'] = bigram_claim_similarity(item)
	features['orderdiff'] = order_diff(item)
	features.update(with_prefix("missing",words_missing(item)))
	features.update(with_prefix("missingtags",tags_missing(item)))
	features.update(with_prefix("extratags",tags_extra(item)))
	return features
		
def context_similarity(item):
	return text_similarity(item['srccontext'],item['matchcontext'])

def claim_context_similarity(item):
	return text_similarity(item['claimtext'],item['matchcontext'])
	
def claim_trim_similarity(item):
	return text_similarity(item['claimtext'],item['trimmedmatch'])
	
def extra_match_words(item):
	return max(0,len(item['matchwords']) - len(item['claimwords']))
	
def extra_claim_words(item):
	return max(0,len(item['claimwords']) - len(item['matchwords']))

def extra_match_chars(item):
	return max(0,len(item['trimmedmatch']) - len(item['claimtext']))

def extra_claim_chars(item):
	return max(0,len(item['claimtext']) - len(item['trimmedmatch']))

def bigram_claim_similarity(item):
	claim_bigrams = set(nltk.bigrams(item['claimwords']))
	match_bigrams = set(nltk.bigrams(item['matchwords']))
	both_bigrams = claim_bigrams & match_bigrams
	either_bigrams = claim_bigrams | match_bigrams
	return float(len(both_bigrams))/len(either_bigrams)
	
def words_missing(item):
	claimwords = set(item['claimwords'])
	matchwords = set(item['matchwords'])
	return claimwords - matchwords

def tags_missing(item):
	claimtagged = set(nltk.pos_tag(item['claimwords']))
	matchtagged = set(nltk.pos_tag(item['matchwords']))
	missingtagged = claimtagged - matchtagged
	missingtags = set([tag for (word,tag) in missingtagged])
	return missingtags
	
def tags_extra(item):
	claimtagged = set(nltk.pos_tag(item['claimwords']))
	matchtagged = set(nltk.pos_tag(item['matchwords']))
	extratagged = matchtagged - claimtagged
	extratags = set([tag for (word,tag) in extratagged])
	return extratags
	
def order_diff(item):
	"""how different is the word ordering"""
	claimorder = dict(zip(item['claimwords'],range(0,100)))
	matchorder = dict(zip(item['matchwords'],range(0,100)))
	both = set(claimorder.keys()) & set(matchorder.keys())
	diff = 0
	for key in both:
		diff += abs(claimorder[key] - matchorder[key])
	return diff
			

def get_context(url,matchtext,before,after):
	html = get_cached_url(url).read()
	textsegments = html_to_text(html)
	i =  textsegments.find(matchtext)
	bigtext = textsegments[max(0,i-before):min(i+after,len(textsegments))]
	return trim_to_words(bigtext)
	
