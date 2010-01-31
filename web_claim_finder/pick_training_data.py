#!/usr/bin/env python
# encoding: utf-8

"""
Create a file containing a subset of claims that a user can use to train with.
"""

import pick_random as p
import claimfinder as cf
import os

#def main(args):
	#phrase = args[1]
	#base = "../output/claimfinder"
	
	#for phrase in cf.phrases:
		#commands.getstatusoutput("cp "+base+"/urlphrases_date/January_10_*"
	
	#filename = "../output/claimfinder/urlphrases_date/January_10_2010
	
	#p.pick_random(	

def main():
	for phrase in cf.phrases:
		print "--- "+phrase+" ---"
		base = "../output/claimfinder"
		phrase = phrase.replace(" ","_")
		claimsname = base + "/urlphrases_date/January_10_*/"+phrase+".claims"
		dedupname = base + "/allyears_jan10/"+phrase+".dedup"
		os.system("python drop_duplicate_claims.py "+claimsname+" >"+dedupname)
		outfile = open("../training/"+phrase+".pickedclaims","w")
		p.pick_random(dedupname,outfile,100)

if __name__ == '__main__':
	main()

