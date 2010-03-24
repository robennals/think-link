#!/usr/bin/env python
# encoding: utf-8

"""
Compare the output of pick_random with the subset of those claims that the user said were good.
Compare this with the subset that is selected by drop_bad_claims.
From this, get figures for precision and recall.
"""

import accuracy_stats as a
import claimfinder as cf
import os

def main():
	for phrase in cf.phrases:
		basename = "../training/"+phrase.replace(" ","_")
		humangood = basename+".manual_good"
		allfile = basename+".pickedclaims"
		if os.path.exists(humangood):
			(good,bad,all) = a.get_human_sets(humangood,allfile)		
			precision = float(len(good))/len(all)
			print phrase,"&",str(int(100*precision)) +"\%"
		
if __name__ == '__main__':
	main()

