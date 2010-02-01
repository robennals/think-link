#!/usr/bin/env python
# encoding: utf-8

"""
Use a classifier to drop sentences that aren't actually making a disputed claim.

We use a simple statistical classifier to do this, based on hand-chosen features.
"""

import nltk
import claimfinder as cf
import accuracy_stats as a
import random
import os

def noun_verb_noun(tags):
	noun1 = False
	verb = False
	thing2 = False
	for tag in tags:
		if tag.startswith("NN") and not noun1:
			noun1 = True
		if tag.startswith("VB") and noun1:
			verb = True
		if tag.startswith("NN") and verb:
			return True
	return False

def noun_verb_adj(tags):
	noun1 = False
	verb = False
	thing2 = False
	for tag in tags:
		if tag.startswith("NN") and not noun1:
			noun1 = True
		if tag.startswith("VB") and noun1:
			verb = True
		if tag.startswith("JJ") and verb:
			return True
	return False

def noun_verb_verb(tags):
	noun1 = False
	verb = False
	thing2 = False
	for tag in tags:
		if tag.startswith("NN") and not noun1:
			noun1 = True
		if tag.startswith("VB") and noun1:
			verb = True
		if tag == "VBG" and verb:
			return True
	return False

def features(claim):
	features = {}
	words = nltk.word_tokenize(claim)
	taggedwords = nltk.pos_tag(words)
	tags = [tword[1] for tword in taggedwords]
	for word in words: features["has-"+word] = True
	for word in words[0:5]: features["early-has-"+word] = True
	for tag in tags: features["tag-"+tag] = True
	for tag in tags[0:5]: features["early-tag-"+tag] = True
	if len(words) > 0:
		features["first-word"] = words[0]
	if len(words) > 1:
		features["second-word"] = words[1]
	if len(words) > 0:
		features["first-tag"] = tags[0]
	if len(words) > 1:
		features["second-tag"] = tags[1]
	features["noun-verb-noun"] = noun_verb_noun(tags)
	features["noun-verb-adj"] = noun_verb_adj(tags)
	features["noun-verb-verb"] = noun_verb_adj(tags)
	features["length"] = len(words)	
	return features

def features_words(claim):
	features = {}
	words = nltk.word_tokenize(claim)
	for word in words: features["has-"+word] = True
	if len(words) > 0:
		features["first"] = words[0]
	if len(words) > 1:
		features["second"] = words[1]
	features["length"] = len(words)
	return features

		
def get_training_data(phrases):
	human_marked = []
	for phrase in phrases:
		basename = "../training/"+phrase.replace(" ","_")
		humangood = basename+".manual_good"
		allfile = basename+".pickedclaims"
		if os.path.exists(humangood):
			(good,bad,all) = a.get_human_sets(humangood,allfile)		
			for claim in good:
				human_marked.append((claim,True))
			for claim in bad:
				human_marked.append((claim,False))
	random.shuffle(human_marked)
	return human_marked

def get_featured_data(phrases):
	annotated = get_training_data(phrases)
	featuresets = [(features(claim),g) for (claim,g) in annotated]
	return featuresets
	
def get_featured_data_split(phrases):
	featuresets = get_featured_data(phrases)
	length = len(featuresets)
	splitpoint = int(length * 0.8)
	train_set,test_set = featuresets[:splitpoint],featuresets[splitpoint:]
	return (train_set,test_set)
	
def real_phrases(phrases):
	return [phrase for phrase in phrases if os.path.exists("../training/"+phrase.replace(" ","_")+".manual_good")]
	
def measure_phrases(phrases):
	phrases	= real_phrases(phrases)
	features = {}
	print " --- accuracy --- "
	for phrase in phrases:
		print "features: "+phrase
		features[phrase] = get_featured_data([phrase])	
	for phrase in phrases:
		print "--",phrase,"--"
		test_set = features[phrase]
		train_set = []
		for otherphrase in phrases:
			if otherphrase != phrase:
				train_set = train_set + features[otherphrase] 
		classifier = nltk.NaiveBayesClassifier.train(train_set)		
		accuracy = nltk.classify.accuracy(classifier,test_set)
		print phrase,"&",str(int(100*accuracy)) +"\%"	
	
def test_classifier(phrases):
	(train_set,test_set) = get_featured_data_split()
	classifier = nltk.NaiveBayesClassifier.train(train_set)	
	print "accuracy = "+nltk.classify.accuracy(classifier,test_set)
	
def test_classifier_all():
	test_classifier(cf.phrases)

def test_classifier_good():
	test_classifier(cf.goodphrases)

if __name__ == '__main__':
	measure_phrases(cf.bad_phrases)

