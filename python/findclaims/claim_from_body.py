"""extract a claim from the body of an HTML page"""

import re
import patterns.regexpatterns as rp
import nltk
import nlptools as nt
import nlptools.html_to_text as ht
import nlptools.sentsplit as ss
import fileinput
import urllib2

def bodys_from_tab_file(f):
	for line in f:
		row = line.strip().split("\t")
		if len(row) > 3:
			yield ht.html_to_text(nt.convert_entities(row[3]))
	
def claims_from_tab_file(f):
	for body in bodys_from_tab_file(f):
		for claim in claims_from_body(body):
			yield claim

def claims_from_body2(body):
	start = 0
	m = rp.regex_all.search(body,0)
	while m:
		#beforetext = body[max(0,m.start()-500):m.start()]
		aftertext = body[m.end():m.end()+500]
		#sentence = ss.first_sentence(aftertext)
		sentence = aftertext
		prefix = body[m.start():m.end()]
		yield (prefix,sentence)
		start = m.end()+1
		m = rp.regex_all.search(body,start)		

def claims_from_html2(content):
	text = ht.html_to_text(nt.convert_entities(content))
	return claims_from_body2(text)

def claims_from_body2(body):
	start = 0
	m = rp.regex_all.search(body,0)
	while m:
		#beforetext = body[max(0,m.start()-500):m.start()]
		aftertext = body[m.end():m.end()+500]
		#sentence = ss.first_sentence(aftertext)
		sentence = aftertext
		prefix = body[m.start():m.end()]
		yield (prefix,sentence)
		start = m.end()+1
		m = rp.regex_all.search(body,start)		

def claims_from_html3(content):
	start = 0
	m = rp.regex_all.search(content,0)
	while m:
		text = content[m.end():m.end()+500]
		prefix = content[m.start():m.end()]
		yield (prefix,text)
		start = m.end()+1
		m = rp.regex_all.search(content,start)
				
def claims_from_body(body):
	start = 0
	m = rp.regex_all.search(body,0)
	while m:
		#beforetext = body[max(0,m.start()-500):m.start()]
		aftertext = body[m.end():m.end()+500]
		sentence = ss.first_sentence(aftertext)
		prefix = body[m.start():m.end()]
		yield (prefix,sentence)
		start = m.end()+1
		m = rp.regex_all.search(body,start)		

def claims_from_html(content):
	text = ht.html_to_text(nt.convert_entities(content))
	return claims_from_body(text)

def claims_from_url(url):
	content = urllib2.urlopen(url).read(400000)
	return claims_from_html(content)
	
def main():
	for (prefix,claim) in claims_from_tab_file(fileinput.input()):
		print prefix,"\t",claim
	
if __name__ == "__main__":
	main()
