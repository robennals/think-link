#!/usr/bin/env python
# encoding: utf-8

"""
Compare the output of pick_random with the subset of those claims that the user said were good.
Compare this with the subset that is selected by drop_bad_claims.
From this, get figures for precision and recall.
"""

import drop_bad_claims as d
import sys

def get_sets(goodfile,allfile):
	humangood = set()
	autogood = set()
	all = set()
	for line in file(goodfile):
		humangood.add(line)
	for line in file(allfile):
		all.add(line)
		if(d.trim_statement(line)):
			autogood.add(line)
	agreed = autogood.intersection(humangood)				
	return (humangood,autogood,agreed)

def main(args):
	allfile = args[1]
	goodfile = args[2]
	humangood = set()
	autogood = set()
	all = set()
	for line in file(goodfile):
		humangood.add(line)
	for line in file(allfile):
		all.add(line)
		if(d.trim_statement(line)):
			autogood.add(line)
	agreed = autogood.intersection(humangood)				
	print "recall = ",float(len(agreed))/len(humangood)
	print "precision = ",float(len(agreed))/len(autogood)
	print "good as judged by human = ",float(len(humangood))/len(all)
	print "good as judged by algorithm = ",float(len(autogood))/len(all)
	
if __name__ == '__main__':
	main(sys.argv)

