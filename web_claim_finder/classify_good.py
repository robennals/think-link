#!/usr/bin/env python
# encoding: utf-8

"""
Use a classifier to drop sentences that aren't actually making a disputed claim.

We use a simple statistical classifier to do this, based on hand-chosen features.
"""

import nltk

def features(claim):
	words = nltk.word_tokenize(claim)
	wordspresent = ["has-"+word for word in words]
	firstword = ["first-"+words[0]]
