#!/usr/bin/env python
# encoding: utf-8
"""
Created by Dan Byler on 2009-12-07.

1. Take URL, query string as inputs
2. Returns first 200-character string beginning with query
"""

import sys
import os
import BeautifulSoup
from html2text import html2text
from pyparsing import *
import urllib2
import re

rex = re.compile(r'\W+')

def h2text(url):
	"""Method using html2text library. Currently unused."""
	try: source = urllib2.urlopen(url).read()
	except IOError, e:
		if hasattr(e, 'reason'):
			print 'We failed to reach a server.'
			print 'Reason: ', e.reason
		elif hasattr(e, 'code'):
			print 'The server couldn\'t fulfill the request.'
			print 'Error code: ', e.code
	else:
		thetext = html2text(unicode(source)).replace('\n','')
		return thetext

def getsoup(url):
	"""Given a url, grabs text and returns BeautifulSoup result set"""
	try: source = urllib2.urlopen(url)
	except IOError, e:
		if hasattr(e, 'reason'):
			print 'We failed to reach a server.'
			print 'Reason: ', e.reason
		elif hasattr(e, 'code'):
			print 'The server couldn\'t fulfill the request.'
			print 'Error code: ', e.code
	else:
		soup = BeautifulSoup.BeautifulStoneSoup(source)
		# re.sub('<[^>]*>','', soup)
		return ''.join(soup.findAll(text=True)).replace('\n','').replace('\t','').replace('\r','')
		# return soup

def pyparse(url):
	"""Uses pyparsing library to import html. From htmlstripper.py example"""
	removeText = replaceWith("")
	scriptOpen,scriptClose = makeHTMLTags("script")
	scriptBody = scriptOpen + SkipTo(scriptClose) + scriptClose
	scriptBody.setParseAction(removeText)

	anyTag,anyClose = makeHTMLTags(Word(alphas,alphanums+":_"))
	anyTag.setParseAction(removeText)
	anyClose.setParseAction(removeText)
	htmlComment.setParseAction(removeText)

	commonHTMLEntity.setParseAction(replaceHTMLEntity)

	# get some HTML
	targetHTML = urllib2.urlopen(url).read()
	# targetHTML = targetPage.read()
	# targetPage.close()

	# first pass, strip out tags and translate entities
	firstPass = (htmlComment | scriptBody | commonHTMLEntity | 
	             anyTag | anyClose ).transformString(targetHTML)

	# first pass leaves many blank lines, collapse these down
	repeatedNewlines = LineEnd() + OneOrMore(LineEnd())
	repeatedNewlines.setParseAction(replaceWith("\n\n"))
	secondPass = repeatedNewlines.transformString(firstPass)
	return ''.join(secondPass).replace('\t',' ').replace('\p', ' ').replace('\n',' ')
	

def getcontext(url, searchstring, method=pyparse):
	"""Given a URL and search string, returns the first string 
	beginning with the query (up to 200 chars)."""
	urltext = method(url)
	# print urltext
	
	# urltext = rex.sub(' ', urltext).upper()
	urltext = re.sub(r'[_\W]+', ' ', urltext).strip()
	start_offset = urltext.find(searchstring)
	if start_offset != -1:
		result = urltext[start_offset:(start_offset+250)]
	return result

def main():
	url = "http://thinkprogress.org/2008/07/22/mccain-anbar-history/"
	searchstring = u'falsely cl'
	# print "H2Text result:"
	# print getcontext(url, searchstring, h2text)
	# print "\nBeautiful soup result:"
	# print getcontext(url, searchstring, getsoup)
	# print "\nPyparsing result:"
	print getcontext(url, searchstring, pyparse)

if __name__ == '__main__':
	main()
