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

def features(claim):
	features = {}
	words = nltk.word_tokenize(claim)
	for word in words: features["has-"+word] = True
	if len(words) > 0:
		features["first"] = words[0]
	if len(words) > 1:
		features["second"] = words[1]
	features["length"] = len(words)
	return features
		
def get_training_data():
	human_marked = []
	for phrase in cf.phrases:
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
	
def get_featured_data():
	annotated = get_training_data()
	featuresets = [(features(claim),g) for (claim,g) in annotated]
	length = len(featuresets)
	splitpoint = int(length * 0.8)
	train_set,test_set = featuresets[:splitpoint],featuresets[splitpoint:]
	return (train_set,test_set)
	
def test_classifier():
	(train_set,test_set) = get_featured_data()
	classifier = nltk.NaiveBayesClassifier.train(train_set)	
	print "accuracy = "+nltk.classify.accuracy(classifier,test_set)
	
