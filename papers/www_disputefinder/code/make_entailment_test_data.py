
import urllib2
import urllib
import xml.dom.minidom as minidom
import re
import nltk
import stopwords
import sys
import random

bossKey = "NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E";
bossSvr = "http://boss.yahooapis.com/ysearch/web/v1";

whitespace = re.compile("\s+")
sentenceend = re.compile("[\.\!\?] ")
wordsep = re.compile("[^\w]")
commentre = re.compile("<!--.*-->")
scriptre = re.compile("<script[^<]*<\/script>")
stylere = re.compile("<style[^<]*<\/style>")
breakre = re.compile("<\/?(div|h.|li|form|br|cite|td|tr|caption)>")
tagre = re.compile("<\/?[^>]*>")

def bossurl(phrase):
	return bossSvr + "/"+urllib.quote_plus(phrase)+"?appid="+bossKey+"&format=xml&count=50"

def convert_entities(text):
	return text.replace("&#8217;","'").replace("&#8220;",'"').replace("&#8221;",'"').replace("&#8230;"," - ").replace("&nbsp;"," ").replace("&amp;","&").replace("&ldquq;",'"').replace("&rdquo;",'"').replace("&acute;","'").replace("&mdash;","-").replace("&quot;","'").replace("&#39;","'").replace("&#039;","'")


def getTextFromHTML(html):
	text = commentre.sub(" ",html.lower())
	text = scriptre.sub(" ",text)
	text = stylere.sub(" ",text)
	text = breakre.sub(". ",text)
	text = tagre.sub(" ",text)
	text = whitespace.sub(" ",text)
	return convert_entities(text)
	
def getBossUrlsForClaim(phrase):
	url = bossurl(phrase)
	xml = minidom.parse(urllib2.urlopen(url))
	urlnodes = xml.getElementsByTagName("url")
	urls = [node.childNodes[0].data for node in urlnodes]
	return urls
	
def getUrlSentences(url):
	try:
		file = urllib2.urlopen(url,None,2000)
		text = getTextFromHTML(file.read())
		sentences = sentenceend.split(text)
		return sentences
	except URLError:
		return []
	
def negated(text):
	return "n't" in text or "not " in text
	
def sentenceEntailsClaim(sentence,claim):
	sentence = sentence.lower()
	claim = claim.lower()
	swords = set(stemWords(wordsep.split(sentence)))
	cwords = stemWords(wordsep.split(claim))
	cwords = set([word for word in cwords if not word in stopwords.stopwords])
	return cwords <= swords and negated(sentence) == negated(claim) and not "?" in sentence and not "question" in sentence


#TODO: avoid repeating sentences?	

def isNew(already,sentence):
	for x in already:
		if x in sentence or sentence in x:
			return False
	return True
		
def getEntailedSentences(claim):
	urls = getBossUrlsForClaim(claim)
	goodsentences = set()
	for url in urls:
		sentences = getUrlSentences(url)
		entailing = [s for s in sentences if sentenceEntailsClaim(s,claim) and isNew(goodsentences,s) and len(s) < 100]
		goodsentences.update(entailing)
	return list(goodsentences)		

stem_regex = re.compile("(s|ed|ing|es|ly|ise|ize|ized|ions|n)$")

def stemWord(word):
	stemmed = stem_regex.sub("",word)
	if len(stemmed) < 3:
		return word
	else:
		return stemmed
		
def stemWords(words):
	return [stemWord(word) for word in words]
		
def main(args):
	claim = args[1]
	sentences = getEntailedSentences(claim)
	random.shuffle(sentences)
	for s in sentences:
		print s


if __name__ == '__main__':
	main(sys.argv)
