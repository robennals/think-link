#!/usr/bin/env python
# encoding: utf-8

"""
This file contains generic functions that are used by the other files
"""

import fileinput
import nltk

def convert_entities(text):
	return text.replace("&#8217;","'").replace("&#8220;",'"').replace("&#8221;",'"').replace("&#8230;"," - ").replace("&nbsp;"," ").replace("&amp;","&").replace("&ldquq;",'"').replace("&rdquo;",'"').replace("&acute;","'").replace("&mdash;","-").replace("&quot;","'")

def tag_claim(claim):
	return nltk.pos_tag(nltk.word_tokenize(claim))

stopwords = ["s",'"',"system","someone","change","country","everyone","way","t","fact","year","more","most","day","people","best","something","person","thing","things","time","life","world","years","part","state","better","anything","power","right","man"]

phrases = [
			"believe that",
			"think that",
			"idea that",
			"claim that",
			"the belief that",
			"who believe that",
			"who think that",
			"believing that",
			"claiming that",
			"it is not the case that",
			"it is not true that",
			"the misconception that",
			"the delusion that",	
			"disagree with the claim that",
			"disagree with the assertion that",
			"into believing that",
			"people who think that",
			"people who believe that",
			"the myth that",
			"the mistaken belief that",
			"the fallacy that",
			"the lie that",
			"the false belief that",
			"the deception that",
			"the misunderstanding that",
			"false claim that",
			"false claim is that",
			"mistakenly believe that",
			"mistaken belief that",
			"the absurd idea that",
			"the hoax that",
			"the deceit that",
			"falsely claimed that",
			"falsely claiming that",
			"erroneously believe that",
			"erroneous belief that",
			"the fabrication that",
			"falsely claim that",
			"bogus claim that",
			"urban myth that",
			"urban legend that",
			"the fantasy that",
			"incorrectly claim that",
			"incorrectly claimed that",
			"incorrectly believe that",
			"stupidly believe that",
			"falsely believe that",
			"wrongly believe that",
			"falsely suggests that",
			"falsely claims that",
			"falsely stated that",
			"absurdity of the claim that",
			"false ad claiming that",
			"crazies who believe that"
		]



bad_phrases = [
			"believe that",
			"think that",
			"idea that",
			"claim that",
			"the belief that",
			"who believe that",
			"who think that",
			"believing that",
			"claiming that"
		]
		
goodphrases = set(phrases) - set(bad_phrases)

