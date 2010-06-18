"""
Use a simple regex grammar to generate all the linguistic patterns
that we look for.
"""

import re
from nlptools import normalize_text
import nlptools.boss as boss
import nlptools.urlcache as uc
from nlptools.xmltools import XML
import time

class Choice:
	items = []
	def __init__(self,items):
		self.items = items
		
class Opt:
	item = None
	def __init__(self,item):
		self.item = item

def regex_choice(words): return "(" + "|".join(words) + ")"

def regex(obj):
	if obj.__class__ == list:
		return "\s*".join([regex(x) for x in obj])
	elif obj.__class__ == str:	
		return obj
	elif obj.__class__ == Opt:
		return "("+regex(obj.item)+")?"
	elif obj.__class__ == Choice:
		return "("+"|".join([regex(x) for x in obj.items])+")"
	else:
		raise "can't make regex"

def allstrings(obj):
	"""list of all strings a regex can expand to. Ignore Opt for the moment."""
	if obj.__class__ == list:
		return combos([allstrings(x) for x in obj])
	elif obj.__class__ == str:
		return [obj]
	elif obj.__class__ == Opt:
		return allstrings(obj.item) + [""]
	elif obj.__class__ == Choice:
		return sum([allstrings(x) for x in obj.items],[])
	else:
		raise "not a valid regex"
	
		
		
def combos(multilist):
	""" given a list of lists, return all flattened lists"""
	if len(multilist) == 0:
		return [""]
	else:
		return [normalize_text(head + " " + tail) for head in multilist[0] for tail in combos(multilist[1:])]
	

def regex_option(words): return "(" + "|".join(words) + ")"


claim = Choice(
	["claim", "claims","idea","ideas", "belief", "beliefs", 
	 "notion", "notions","rumor","rumors","assertion","assertions",
	 "suggestion","suggestions","contention","contentions",
	 "argument","arguments","accusation","accusations"])

falseclaim = Choice([
	"delusion","misconception","lie","hoax","scam",
	"misunderstanding","myth","urban legend","urban myth",
	"fabrication","deceit","fallacy",
	"deception","fraud","swindle","fantasy","misperception"])
	
refute = Choice([
	"refute", "refuting", "refuted", "refutation of",
	"rebut", "rebutting", "rebutted",
	"debunk", "debunking", "debunked",
	"discredit", "discrediting", "discredited",
	"disprove", "disproving", "disproved",
	"invalidate", "invalidating", "invalidated",
	"counter", "countering", "countered",
	"give the lie to","disagree with","absurdity of",
	"contrary to","against",
	"reject","rejecting","rejected","rejection of"
	])

claiming = Choice(["claiming","asserting","thinking","suggesting","stating"])
claims = Choice(["claims","asserts","thinks","suggests","asserts","state"])
badly = Choice(["falsely","wrongly","stupidly","erroneously","incorrectly","mistakenly","misleadingly","deceptively","fraudulently"])

think = Choice(["think","believe","claim","assert","argue","state"])
thought = Choice(["thought","believed","claimed","asserted","stated"])

crazies = Choice(["crazies","idiots","fanatics","lunatics","morons",
		"crackpots","cranks","loons","nuts","wingnuts","wackos",
		"bigots"])
who = Choice(["who","that"])

believing = Choice(["believing","thinking"])

good = Choice(["acceptible","credible","serious","scientific"])
claim_modifier = Choice(["popular", "widespread", "oft repeated"])
false_modifier = Choice(["false","fraudulent","bogus","disputed","misleading","deceptive","fake","mistaken","absurd","erroneous"])
false = Choice(["not true","false","a lie","a myth","not the case"])
ofcourse = Choice(["of course","obviously"])

recog_false = ["the",falseclaim,Opt("is")]
recog_mod = [false_modifier,claim,Opt("is")]
recog_refute = [refute,"the",claim]
recog_nogood = ["no",good,"evidence"]
recog_noev = ["no","evidence"]
recog_noev_ex = ["no evidence supports the",claim]
recog_not = ["it is",false,Opt(ofcourse)]
recog_ing = [badly,claiming]
recog_s = [badly,claims]
recog_think = [badly,think]
recog_ed = [badly,thought]
recog_crazies = [crazies,who,think]
recog_crazing = [crazies,claiming]
recog_into = ["into",believing]

recog_all = [Choice([
		recog_false,recog_mod,recog_refute,recog_nogood,recog_noev,recog_noev_ex,
		recog_not,recog_ing,recog_think,recog_ed,recog_crazies,
		recog_crazing,recog_into,recog_s]),"that"]

regex_all = re.compile(regex(recog_all),re.IGNORECASE)
			
strings_all = allstrings(recog_all)			
				

def boss_counts_for_pattern(pattern):
	"""get the total number of hits for a pattern, and also download the first 50"""
	url = boss.get_boss_url(pattern,0,50)
	dom = XML(uc.get_cached_url("boss",url))
	hitcount = dom.find("resultset_web").attr("totalhits")
	return int(hitcount)

def boss_results_for_pattern(pattern):
	return boss.get_boss_all('"'+pattern+'"')

def counts_for_all():
	"""download BOSS results for all of our search strings"""
	for pattern in strings_all:
		uc.downloaded = False
		count = boss_counts_for_pattern('"'+pattern+'"')
		print pattern,":",count
		if uc.downloaded:
			print "downloaded"
			time.sleep(2)

def total_counts():
	total = 0
	for pattern in strings_all:
		uc.downloaded = False
		count = boss_counts_for_pattern('"'+pattern+'"')
		total += count
		print pattern,":",count
	print "total:",total

def boss_for_all():
	counts = {}
	predicted = {}
	"""download BOSS results for all of our search strings"""
	for pattern in strings_all:
		uc.downloaded = False
		print "--- "+pattern+" ---"	
		results = boss.get_boss_all('"'+pattern+'"')
		if uc.downloaded:
			print "downloaded all"
			time.sleep(2)
		print "downloaded =",len(results)
		counts[pattern] = len(results)
		predicted[pattern] = boss_counts_for_pattern('"'+pattern+'"')
		print "predicted =",predicted[pattern]
	return (counts,predicted)
	
def boss_for_all_out(outfile):
	counts = {}
	predicted = {}
	"""download BOSS results for all of our search strings"""
	for pattern in strings_all:
		uc.downloaded = False
		print "--- "+pattern+" ---"	
		results = boss.get_boss_all('"'+pattern+'"')
		for result in results:
			outfile.write(result['date']+"\t"+result['url']+"\t\""+pattern+"\"\n")
		if uc.downloaded:
			print "downloaded all"
			time.sleep(2)
		print "downloaded =",len(results)
		counts[pattern] = len(results)
		predicted[pattern] = boss_counts_for_pattern('"'+pattern+'"')
		print "predicted =",predicted[pattern]
	return (counts,predicted)
	

salts = range(1996,2011)
salts.reverse()

def boss_salted(pattern,salts):
	count = boss_counts_for_pattern(pattern)
	print "pattern:",pattern
	if count > 1000 and len(salts) > 0:
		salt = salts[0]
		yes = boss_salted(pattern+" +"+str(salt),salts[1:])
		no = boss_salted(pattern+" -"+str(salt),salts[1:])
		return yes + no
	else:
		return len(boss.get_boss_all(pattern))
	
def boss_salted_out(pattern,salts,outfile):
	count = boss_counts_for_pattern(pattern)
	print "pattern:",pattern
	if count > 1000 and len(salts) > 0:
		salt = salts[0]
		yes = boss_salted_out(pattern+" +"+str(salt),salts[1:],outfile)
		no = boss_salted_out(pattern+" -"+str(salt),salts[1:],outfile)
	else:	
		results = boss.get_boss_all(pattern)
		for result in results:
			outfile.write(result['date']+"\t"+result['url']+"\t"+pattern+"\n")
	
	
# refuteterms = allforms(refutewords) + refuteother


# what we look for is
# pattern Wiki-verified-unambiguous-noun bla

# e.g. the swingle that Barack Obama ...
# this gives us both disambiguation, and well-formedness in one go
#
# excludes rubish like "the hoax that won't go away"
# and "the false claim that he didn't do it"

# recognizer vs search term
# for recognizer, might be better to use wordnet and stemmer to get better
# accuracy. For searching Yahoo BOSS, we do need to trim back to credible things.
# search for each combination and see which is frequent.
