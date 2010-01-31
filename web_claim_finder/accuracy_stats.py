#!/usr/bin/env python
# encoding: utf-8

"""
Compare the output of pick_random with the subset of those claims that the user said were good.
Compare this with the subset that is selected by drop_bad_claims.
From this, get figures for precision and recall.
"""

import drop_bad_claims as d
import sys

def get_human_sets(goodfile,allfile):
	humangood = set()
	all = set()
	for line in file(goodfile):
		humangood.add(line)
	for line in file(allfile):
		all.add(line)
	humanbad = all - humangood
	return (humangood,humanbad,all)

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
	agreegood = autogood.intersection(humangood)	
	agreebad = (all - autogood).intersection(all - humangood)
	agree = agreegood.union(agreebad)
	print "recall = ",float(len(agreegood))/len(humangood)
	print "precision = ",float(len(agreegood))/len(autogood)
	print "accuracy = ",float(len(agree))/len(all)
	print "good as judged by human = ",float(len(humangood))/len(all)
	print "good as judged by algorithm = ",float(len(autogood))/len(all)
	
if __name__ == '__main__':
	main(sys.argv)

