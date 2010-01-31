#!/usr/bin/env python
# encoding: utf-8

"""
Pick a random subset of the claims from a "dedup" list.
Output csv, with each row containing a number and claim text.
The user then looks at this file and deletes every line 
"""

import random
import sys
import claimfinder as cf

number_to_pick = 200

def get_lines(filename,pickedlines,outfile):
	i = 0
	for line in file(filename):
		if len(line.split("\t")) > 1 and "<" not in line:
			if i in pickedlines:
				outfile.write(cf.convert_entities(line.split("\t")[1]))
			i+=1

def count_lines(filename):
	i = 0
	for line in file(filename):
		i+=1
	return i

def random_set(max,howmany):
	rands = set()
	for i in range(0,howmany):
		rand = random.randint(0,max)
		while rand in rands:
			rand = random.randint(0,max)
		rands.add(rand)			
	return rands
	
def pick_random(filename,outfile,howmany):
	count = count_lines(filename)
	if count/2 < howmany: return
	picked = random_set(count,howmany)
	# picked = set([random.randint(0,count) for i in range(0,howmany)])
	get_lines(filename,picked,outfile)

def main(args):
	pick_random(args[1],sys.stdout,number_to_pick)

#def main(args):
	#filename = args[1]
	#count = count_lines(filename)
	#picked = set([random.randint(0,count) for i in range(0,number_to_pick)])
	#get_lines(filename,picked,sys.stdout)

if __name__ == '__main__':
	main(sys.argv)
