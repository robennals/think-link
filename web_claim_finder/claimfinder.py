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

stopwords = ["s",'"',"system","someone","change","country","everyone","way","t","fact","year","more","most","day","people","best","something","person","thing","things","time","life","world","years","part","state","better","anything","power","right","man"]
