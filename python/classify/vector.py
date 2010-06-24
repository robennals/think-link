
from makedb.makedb import unescape
from settings import localfile
import math
import re

doccount = 4124

def tokenize(claim): return re.split("\W+",claim)

def load_bnc_word_freqs():
#	filename = "/home/rob/git/thinklink/reference/bnc_corpus_all.num.o5.txt"
	docfreqs = {}
	for line in localfile("data/bnc_corpus_all.num.o5.txt"):
		termfreq,term,type,docfreq = line.strip().split(" ")
		if term not in docfreqs:	# TODO: not sure if this is correct
			docfreqs[term] = int(docfreq)
	return docfreqs

word_freqs = load_bnc_word_freqs()

def tfidf(word,freq,totalwords):
	return tf(freq,totalwords) * idf(word)
	
def tf(freq,totalwords):
	return float(freq)/totalwords	

def idf(word):
	freq = word_freqs.get(word,6)
	return math.log(float(doccount)/freq)

def freqdist(words):
	freqs = {}
	for word in words:
		freqs[word] = freqs.get(word,0) + 1
	return freqs

def magnitude(vector):
	total = 0.0
	for key in vector:
		total += vector[key]*vector[key]
	return math.sqrt(total)

def normalize(vector):
	mag = magnitude(vector)
	normvec = {}
	for key in vector:
		normvec[key] = vector[key]/mag
	return normvec

def make_tfidf_vector(text):
	words = tokenize(text.lower())
	totalwords = len(words)
	freqs = freqdist(words)
	return dict([(word,tfidf(word,freq,totalwords)) for (word,freq) in freqs.iteritems()])

def norm_word_vector(text):
	words = tokenize(text.lower())
	totalwords = len(words)
	freqs = freqdist(words)
	tfidf_vector = dict([(word,tfidf(word,freq,totalwords)) for (word,freq) in freqs.iteritems()])
	norm_vector = normalize(tfidf_vector)
	return norm_vector

def dot_product(veca,vecb):
	total = 0.0
	for key in veca:
		total += veca[key] * vecb.get(key,0)
	return total

def text_similarity(text_a,text_b):
	vec_a = norm_word_vector(text_a)
	vec_b = norm_word_vector(text_b)
	return dot_product(vec_a,vec_b)
		
	

	
