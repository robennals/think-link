#!/usr/bin/env python
# encoding: utf-8

"""
This file contains generic functions that are used by the other files
"""

import fileinput
import nltk

def convert_entities(text):
	return text.replace("&#8217;","'").replace("&#8220;",'"').replace("&#8221;",'"').replace("&#8230;"," - ").replace("&nbsp;"," ")

def tag_claim(claim):
	return nltk.pos_tag(nltk.word_tokenize(claim))
