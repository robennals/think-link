
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
import settings
import pickle
from urlcheck.models import MatchVote
import svmutil

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

def item_from_votedata(votedata):
	return {'claimtext':votedata.claimtext,'vote':votedata.vote,
			'matchurl':votedata.pageurl,'srcurl':votedata.claimurl,
			'srccontext':votedata.claimcontext,
			'matchcontext':votedata.pagecontext}
			
def collect_claim_votes(votedata):
	votes = {}
	for item in votedata:
		if not item.claimtext in votes:
			votes[item.vote] = {}
		votes[item.vote][item.claimtext] = votes[item.vote].get(item.claimtext,0) + 1
	return votes				


def training_data_from_matchvotes():
	allvotes = MatchVote.objects.all()
	items = [item_from_votedata(vd) for vd in allvotes]
	features = [features_for_item(item) for item in items]	
	labels = [from_bool(vd.vote == 'good') for vd in allvotes]
	range = find_ranges(features)
	mapping = find_mapping(features)
	scaled = [scale_data(fitem,range) for fitem in features]
	mapped = [remap_keys(sitem,mapping) for sitem in scaled] 
	return (mapped,labels,range,mapping)

# c=32768.0, g=0.0001220703125 CV rate=73.0

def train_classifier(mapped,labels):
	return svmutil.svm_train(labels,[dict(x) for x in mapped],
		"-b 1 -c 32768 -g 0.0001220703125")

def save_new_model(filename):
	mapped,labels,range,mapping = training_data_from_matchvotes()
	model = train_classifier(mapped,labels)
	svmutil.svm_save_model(filename+".model",model)
	pickle.dump(range,file(filename+".range","w"))
	pickle.dump(mapping,file(filename+".mapping","w"))

def load_model(filename):
	model = svmutil.svm_load_model(filename+".model")
	range = pickle.load(file(filename+".range"))
	mapping = pickle.load(file(filename+".mapping"))
	return model,range,mapping
	
def classify_item(item,model,range,mapping):
	features = features_for_item(item)
	scaled = scale_data(features,range)
	mapped = remap_keys(scaled,mapping)
	p_label, p_acc, p_val = svmutil.svm_predict([0],[dict(mapped)],model,"-b 1")
	return p_val[0][1]

def add_shared_props(item):
	item['claimwords'] = tokenize(item['claimtext'].lower())
	item['matchwords'] = get_trimmed_match(item)	
	item['trimmedmatch'] = " ".join(item['matchwords'])	
	item['claimtags'] = nltk.pos_tag(item['claimwords'])
	item['matchtags'] = nltk.pos_tag(item['matchwords'])	

def get_trimmed_match(item,maxgap=3):
	keyword = cr.claim_words(item['claimtext'])[0]
	matchwords = rm.trim_text(tokenize(item['matchcontext'].lower()),keyword,item['claimtext'].lower(),maxgap)
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
		item['claimwords'] = tokenize(item['claimtext'].lower())
		get_trimmed_match(item)
		return False
	except:
		return True


#features = [
	#claim_rareness,claim_length,context_similarity,
	#claim_trim_similarity,extra_match_words,
	#extra_match_chars,extra_claim_chars,
	#extra_match_words,extra_claim_words,
	#claim_word_overlap,claim_word_overlap_nostop,
	#norm_word_overlap,bigram_overlap,
	#trigram_overlap,order_diff,
	#polarity_same,match_has_pattern]
	


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
	features['polaritysame'] = polarity_same(item)
	features['haspattern'] = match_has_pattern(item)
	features['isnegated'] = from_bool(is_negated(item['claimtext']))
	features['contextnegated'] = from_bool(is_negated(item['matchcontext']))
	features['contextpoldiff'] = from_bool(is_negated(item['matchcontext']) != is_negated(item['claimtext']))
	features.update(with_prefix("missing",words_missing(item)))
	features.update(with_prefix("missingtags",tags_missing(item)))
	features.update(with_prefix("extratags",tags_extra(item)))
	return features
	#return (item['vote'],features,item)

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
	return dict([(key,float(features[key])/ranges[key]) for key in features if key in ranges])

def save_ranges(ranges):
	outfile = settings.localfile("data/svm_range.range","w")
	pickle.dump(ranges,outfile)
	outfile.close()
	
def load_ranges(ranges):
	return pickle.load(settings.localfile("data/svm_range.range","w"))		


keyids = {}
next_keyid = 1
def get_key_id(text):
	global next_keyid
	if text not in keyids:
		keyids[text] = next_keyid
		next_keyid += 1
	return keyids[text]

def remap_keys(features,mapping):
	remapped = [(mapping[key],features[key]) for key in features if key in mapping]
	return sorted(remapped,key=op.itemgetter(0))

def find_mapping(fitems):
	mapping = {}
	next_keyid = 1
	for fitem in fitems:
		for key in fitem.keys():
			if key not in mapping:
				mapping[key] = next_keyid
				next_keyid += 1
	return mapping			
				
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
	return from_bool(rp.regex_all.search(item['matchcontext']))

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
	claimtagged = set(item['claimtags'])
	matchtagged = set(item['matchtags'])
	missingtagged = claimtagged - matchtagged
	missingtags = set([tag for (word,tag) in missingtagged])
	return missingtags
	
def tags_extra(item):
	claimtagged = set(item['claimtags'])
	matchtagged = set(item['matchtags'])
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
	return from_bool(is_negated(item['claimcontext']))

def claim_negated(item):
	return from_bool(is_negated(item['claimtext']))

def polarity_same(item):
	return from_bool(is_negated(item['claimtext']) == is_negated(item['trimmedmatch']))
	
			

def get_context(url,matchtext,before,after):
	html = get_cached_url(url).read()
	textsegments = html_to_text(html)
	i =  textsegments.find(matchtext)
	bigtext = textsegments[max(0,i-before):min(i+after,len(textsegments))]
	return trim_to_words(bigtext)
	
