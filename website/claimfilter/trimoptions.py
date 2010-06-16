# coding=utf-8

from nlptools.html_to_text import inline, space, starts_in_tag, html_to_text, html_to_segments
import re
import wicow_stats.claimfinder as cf

def cleanup(claim):
	claim = cf.convert_entities(claim)
	claim = cf.convert_unicode(claim)


def simplify(str):
	str = inline.sub(" ",str)
	str = space.sub(" ",str)
	return str
	
def tokenize(claim): return re.split("(\W)",claim)
	
splitpoints = ["\n","\r","<",">","?","!",".",";",":","is",",","and","-",
			"another","just","becoming","when","or","despite","but",
			"was","has","did","have",'"',"had","because","by","in","(",
			"however","even","that","it","often","which","thereby","stating",
			"unaware","thus","should", "gets",u"—"]

def fixstring(str):
	"""remove crap characters due to interpreting utf-8 as microsoft code page"""
	str = str.replace(u"â€œ",u'"').replace(u"â€™",u"'").replace(u"â€",u'"')
	str = cf.convert_entities(str)
	str = cf.convert_unicode_u(str)
	str = html_to_segments(str)
	return str.strip()
	
def trimoptions(str):
	str = fixstring(str)
	tokens = tokenize(str)
	offsets = [i for i in range(0,len(tokens)) if tokens[i] in splitpoints]
	trims = [tokens[:i] for i in offsets]
	#trims = [tokens[:tokens.index(s)] for s in splitpoints if s in tokens] + [tokens]
	trims = ["".join(s).strip() for s in trims]
	trims = [s for s in trims if len(s) < 200]
	return sorted(trims,key=len)[:10]
			
def is_crap(str):
	return starts_in_tag(str)

def test_trimmer(labelled,trimmer):
	"""how accurate is a trimmer, and where does it go wrong"""
	bad = []
	total = 0
#	labelled = RawClaim.objects.exclude(correctrim="")
	bad = [l for l in labelled if trimmer(l.sentence) != l.correcttrim]
	return ((1-float(bad)/len(labelled)),bad)		

def correct_ends_with(sentence,correct,str):
	sentence = fixstring(sentence.strip())
	correct = correct.strip()
	return sentence[:len(correct)] == correct and sentence[len(correct):].strip().startswith(str)

def normal(str): return not str in ["X","?"]

def end_rate(lablled,str):
	"""how reliable is it to use 'str' as an end of claim marker"""
#	labelled = RawClaim.objects.exclude(correcttrim="")
	bad = [l for l in labelled if str in l.correcttrim and normal(l.correcttrim)]
	good = [l for l in labelled if correct_ends_with(l.sentence,l.correcttrim,str)]
	return (float(len(good))/(len(good)+len(bad)),bad,good)

def bad_start_rate(labelled,str):
	"""how reliable is it to use 'str' as a bad claim marker"""
#	labelled = RawClaim.objects.exclude(correcttrim="")
	filtered = set([l for l in labelled if fixstring(l.sentence).startswith(str)])
	wrong = set([l for l in filtered if l.correcttrim!="X"])
	right = filtered - wrong
	return (float(len(right))/len(filtered),wrong,right)

		
""" things that would otherwise look like claim ends, but aren't"""
notends = ["Mrs.","Mr.","Ms.","U.S.","U.S.A.","U.N.","U. S.","U. S. A.",
		"Jan.","Feb.","Mar.","Apr.","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."]
ends = [";","?","!",'."','".',".'","and that","or that"," - "," -- ","- ","\t",", this"]
re_ends = ["\.\W[^a-z][^\.]"]

def simple_trim(str):
	end_offs = set([str.find(end) for end in ends if end in str]) | set([len(str)])
	re_offs = set([re.search(r,str).start() for r in re_ends if re.search(r,str)])
	bad_offs = set([str.find(notend)+len(notend)-1 for notend in notends if notend in str])
	goodends = sorted((end_offs | re_offs) - bad_offs)
	return str[:goodends[0]]
	
	
maybe_extras = [", I",", that we",", we",'"',", and secondly","or that","and that",
			"is perceived",", could not stand",
			"should be debunked","did not make me","is just a fabrication","see more",", she"]

badstarts = ["keeps","told","tells","surrounds","were","limit","have","are",
				"underlie","stem","cannot","often","are","might","may","get","was","has"]
ambigstarts = ["I","he","they","it is"]	

# simple sentence tokenizer.
# punctuation point, followed by a capital letter. Does that beat just a period?

def is_bad(str):
	tokens = tokenize(fixstring(str))
	firstword = tokens[0].lower()
	return firstword in badstarts or firstword in ambigstarts

