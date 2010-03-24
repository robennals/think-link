"""
Use a simple regex grammar to generate all the linguistic patterns
that we look for.
"""

import re

class Choice:
	items = []
	def __init__(self,items):
		self.items = items
		
class Opt:
	item = None
	def __init__(self,item):
		self.item = item

claim = ["claim", "idea", "belief", "notion","rumor","assertion","suggestion"]

falseclaim = [
	"delusion","misconception","lie","hoax","scam",
	"misunderstanding","myth","urban legend","urban myth",
	"fabrication","deceit","fallacy",
	"deception","fraud","swindle","fiction","fantasy"]
	
refute = [
	"refute", "refuting", "refuted", "refutation of",
	"rebut", "rebutting", "rebutted",
	"debunk", "debunking", "debunked",
	"discredit", "discrediting", "discredited",
	"disprove", "disproving", "disproved",
	"invalidate", "invalidating", "invalidated",
	"counter", "countering", "countered",
	"give the lie to","disagree with","absurdity of"
	]

claiming = ["claiming","asserting","thinking"]
badly = ["falsely","wrongly","stupidly","erroneously","incorrectly"]

think = ["think","believe","claim","assert"]
thought = ["thought","believed","claimed","asserted"]

crazies = ["crazies","idiots","fanatics","lunatics","morons",
		"crackpots","cranks","loons","nuts","wingnuts","wackos",
		"bigots"]

believing = ["believing","thinking"]

good = ["acceptible","credible","serious","scientific"]
claim_modifier = ["popular", "widespread", "oft repeated"]
false_modifier = ["false","bogus","disputed","misleading","fake","mistaken"]
false = ["not true","false","a lie"]

def regex_option(words): return "(" + "|".join(words) + ")"


recog_false = "the "+regex_option(falseclaim)+"( is)? that"
recog_mod = "the "+regex_option(false_modifier)+" "+regex_option(claim)+"( is)? that"
recog_refute = regex_option(refute)+" the "+regex_option(claim)+" that"
recog_nogood = "no "+regex_option(good)+" evidence that"
recog_not = "it is "+regex_option(false)+" that"
recog_ing = regex_option(badly)+" "+regex_option(claiming)+" that"
recog_think = regex_option(badly)+" "+regex_option(think)+" that"
recog_ed = regex_option(badly)+" "+regex_option(thought)+" that"
recog_crazies = regex_option(crazies)+" who "+regex_option(think)+" that"
recog_crazing = regex_option(crazies)+" "+regex_option(claiming)+" that"
recog_into = "into "+regex_option(believing)+" that"

recog_all = regex_option([
		recog_false,recog_mod,recog_refute,recog_nogood,
		recog_not,recog_ing,recog_think,recog_ed,recog_crazies,
		recog_crazing,recog_into])
regex_all = re.compile(recog_all)
				
	
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
