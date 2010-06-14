
from makedb.makedb import unescape
from nlptools.urlcache import get_cached_url
from nlptools.html_to_text import html_to_segments, html_to_text
from nlptools import trim_to_words
import websearch.rareword_match as rm
import websearch.compute_rarewords as cr
import math
from vector import text_similarity, tfidf, idf
import nltk
import re
import patterns.regexpatterns as rp
import operator as op

def tokenize(claim): return re.split("[\W=]+",claim)

filename = "/home/rob/git/thinklink/output/training/rawinput.csv"


stopwords = set(nltk.corpus.stopwords.words('english'))

def load_data_features(filename):
	for line in file(filename):
		cols = [unescape(col) for col in line.strip('\n').split("\t")] 
		claimtext,vote,matchurl,srcurl,srccontext,matchcontext,srctitle = cols
		item = {'claimtext':claimtext,'vote':vote,'matchurl':matchurl,
			'srcurl':srcurl,'srccontext':srccontext.lower(),
			'matchcontext':matchcontext.lower(),'srctitle':srctitle.lower()}
		yield item

def add_shared_props(item):
	item['claimwords'] = tokenize(item['claimtext'])
	item['matchwords'] = get_trimmed_match(item)	
	item['trimmedmatch'] = " ".join(item['matchwords'])			

def get_trimmed_match(item,maxgap=3):
	keyword = cr.claim_words(item['claimtext'])[0]
	matchwords = rm.trim_text(tokenize(item['matchcontext']),keyword,item['claimtext'],maxgap)
	if len(set(tokenize(item['claimtext'])) - set(matchwords) - rm.okwords) > 0 and maxgap < 6:
		return get_trimmed_match(item,maxgap+1)
	return matchwords

def with_prefix(prefix,s):
	"""
	Given a set and a prefix, creates a dictionary mapping each item
	in the set, prefixed by <prefix> to 1.
	
	>>> with_prefix("x",set(['x','y','z']))
	{'x-x': 1, 'x-y': 1, 'x-z': 1}
	"""
	return dict.fromkeys(set([prefix + "-" + name for name in s]),1)


def from_bool(bool):
	"""
	Converts True/False into 1/0 for use in an svm
	
	>>> from_bool(True)
	1
	>>> from_bool(False)
	0
	"""
	if bool: return 1
	else: return 0
	
def add_set_features(features,prefix,set):
	setitems = [prefix + name for name in set]
	features.update(dict.fromkeys(setitems,1))

def is_broken(item):
	try:
		item['claimwords'] = tokenize(item['claimtext'])
		get_trimmed_match(item)
		return False
	except:
		return True

def selected_features(item):
	add_shared_props(item)
	features = {}
	features['claimrareness'] = claim_rareness(item)
	features['claimlength'] = claim_length(item)
	features['contextsim'] = context_similarity(item)
	features['claimcontextsim'] = claim_context_similarity(item)
	features['claimtrimsim'] = claim_trim_similarity(item)
	features['extramatchwords'] = extra_match_words(item)
	features['extraclaimwords'] = extra_claim_words(item)
	features['extramatchchars'] = extra_match_chars(item)
	features['extraclaimchars'] = extra_claim_chars(item)
	features['wordoverlap'] = claim_word_overlap(item)
	features['wordoverlapns'] = claim_word_overlap_nostop(item)
	features['normoverlap'] = norm_word_overlap(item)
	features['bigramoverlap'] = bigram_overlap(item)
	features['trigramoverlap'] = trigram_overlap(item)
	features['orderdiff'] = order_diff(item)
	features['polaritydiff'] = from_bool(not polarity_same(item))
	features['haspattern'] = from_bool(match_has_pattern(item))
	features['isnegated'] = from_bool(is_negated(item['claimtext']))
	features['contextnegated'] = from_bool(is_negated(item['matchcontext']))
	features['contextpoldiff'] = from_bool(is_negated(item['matchcontext']) != is_negated(item['claimtext']))
	features.update(with_prefix("missing",words_missing(item)))
	features.update(with_prefix("missingtags",tags_missing(item)))
	features.update(with_prefix("extratags",tags_extra(item)))
	return (item['vote'],features,item)


def features_for_item(item):
	add_shared_props(item)
	features = {}
	features['claimrareness'] = claim_rareness(item)
	features['claimlength'] = claim_length(item)
	features['contextsim'] = context_similarity(item)
	features['claimcontextsim'] = claim_context_similarity(item)
	features['claimtrimsim'] = claim_trim_similarity(item)
	features['extramatchwords'] = extra_match_words(item)
	features['extraclaimwords'] = extra_claim_words(item)
	features['extramatchchars'] = extra_match_chars(item)
	features['extraclaimchars'] = extra_claim_chars(item)
	features['wordoverlap'] = claim_word_overlap(item)
	features['wordoverlapns'] = claim_word_overlap_nostop(item)
	features['normoverlap'] = norm_word_overlap(item)
	features['bigramoverlap'] = bigram_overlap(item)
	features['trigramoverlap'] = trigram_overlap(item)
	features['orderdiff'] = order_diff(item)
	features['polaritydiff'] = from_bool(not polarity_same(item))
	features['haspattern'] = from_bool(match_has_pattern(item))
	features['isnegated'] = from_bool(is_negated(item['claimtext']))
	features['contextnegated'] = from_bool(is_negated(item['matchcontext']))
	features['contextpoldiff'] = from_bool(is_negated(item['matchcontext']) != is_negated(item['claimtext']))
	features.update(with_prefix("missing",words_missing(item)))
	features.update(with_prefix("missingtags",tags_missing(item)))
	features.update(with_prefix("extratags",tags_extra(item)))
	return (item['vote'],features,item)

def make_svm_training_data(items,yeslabels,nolabels,outfile):
	featureitems = [features_for_item(item) for item in items if not is_broken(item)]
	justfeatures = [x[1] for x in featureitems]
	range = find_ranges(justfeatures)
	for (vote,features,item) in featureitems:
		if vote in yeslabels:
			ans = 1
		elif vote in nolabels:
			ans = -1
		else:
			continue
		outfile.write(str(ans)+" ")
		featurelist = remap_keys(scale_data(features,range))
		sortedfeatures = sorted(featurelist,key=op.itemgetter(0))
		featuretext = [str(id)+":"+str(val) for (id,val) in sortedfeatures]
		outfile.write(" ".join(featuretext)+"\n")
		
def find_ranges(featurelist):
	"""all initial features are positive integers. Scale them to max 1"""
	maxvalues = {}
	for features in featurelist:
		for key in features:
			if key not in maxvalues: maxvalues[key] = 0
			if features[key] > maxvalues.get(key,0):
				maxvalues[key] = features[key]
	return maxvalues
	
def scale_data(features,ranges):
	return dict([(key,float(features[key])/ranges[key]) for key in features])

keyids = {}
next_keyid = 1
def get_key_id(text):
	global next_keyid
	if text not in keyids:
		keyids[text] = next_keyid
		next_keyid += 1
	return keyids[text]

def remap_keys(features):
	return [(get_key_id(key),features[key]) for key in features]
				
def claim_rareness(item):
	return sum([idf(word) for word in item['claimwords']])		

def claim_length(item):
	return len(item['claimwords'])

	
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

def match_has_pattern(item):
	return rp.regex_all.search(item['matchcontext'])

def claim_word_overlap(item):
	claimwords = set(item['claimwords'])
	matchwords = set(item['matchwords'])
	both = claimwords & matchwords
	either = claimwords | matchwords
	return float(len(both))/len(either)

def claim_word_overlap_nostop(item):
	claimwords = set(item['claimwords']) - stopwords
	matchwords = set(item['matchwords']) - stopwords
	both = claimwords & matchwords
	either = claimwords | matchwords
	return float(len(both))/len(either)
		
def norm_word_overlap(item):
	claimwords = set(item['claimwords'])
	matchwords = set(item['matchwords'])
	both = claimwords & matchwords
	either = claimwords | matchwords
	return float((2*len(both)))/(len(claimwords) + len(matchwords))
	
def bigram_overlap(item):
	claim_bigrams = set(nltk.bigrams(item['claimwords']))
	match_bigrams = set(nltk.bigrams(item['matchwords']))
	both_bigrams = claim_bigrams & match_bigrams
	either_bigrams = claim_bigrams | match_bigrams
	return float(len(both_bigrams))/max(1,len(either_bigrams))

def trigram_overlap(item):
	claim_trigrams = set(nltk.trigrams(item['claimwords']))
	match_trigrams = set(nltk.trigrams(item['matchwords']))
	both_trigrams = claim_trigrams & match_trigrams
	either_trigrams = claim_trigrams | match_trigrams
	return float(len(both_trigrams))/max(1,len(either_trigrams))
	
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
	"""sum of differences of word positions"""
	claimorder = dict(zip(item['claimwords'],range(0,100)))
	matchorder = dict(zip(item['matchwords'],range(0,100)))
	both = set(claimorder.keys()) & set(matchorder.keys())
	diff = 0
	for key in both:
		diff += abs(claimorder[key] - matchorder[key])
	return float(diff)/len(both)
	
#def words_in_order(item):
	#"""number of words with different word before them - same as bigram overlap?"""
	#claimorder = dict(zip(item['claimwords'],range(0,100)))
	#matchorder = dict(zip(item['matchwords'],range(0,100)))
	#both = set(claimorder.keys()) & set(matchorder.keys())
	#diff = 0
	#for key in both:
		
	
	
negwords = set(["not","no","nothing","non","nor","nobody","never","neither","nor"])
	
def is_negated(text):
	if "n't" in text: return True
	words = set(tokenize(text))
	return len(negwords & words) > 0

def context_negated(item):
	return is_negated('claimcontext')

def polarity_same(item):
	return is_negated(item['claimtext']) == is_negated(item['trimmedmatch'])
	
			

def get_context(url,matchtext,before,after):
	html = get_cached_url(url).read()
	textsegments = html_to_text(html)
	i =  textsegments.find(matchtext)
	bigtext = textsegments[max(0,i-before):min(i+after,len(textsegments))]
	return trim_to_words(bigtext)
	
