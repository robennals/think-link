#!/usr/bin/env python
# encoding: utf-8

"""
We don't want to record the exact same claim multiple times from the same URL.
This code reads in a list of files, removes duplicates claims, and then spits out 
a de-duplicated list.

Input format is tab separated with columns of: url,title,claim,context
Ouptput format is tab separated with columns of: domain,claim
	
Note that this version only works if all the claim text will fit in memory.
In the future, we could avoid this problem by splitting based on the domain name.
"""

import re
import fileinput

domainclaims = {}

def get_domain(url):
	m = re.search("https?://([\w\.]+)",url)
	return m.group(1)

def add_line(line):
	fields = line.split("\t")
	if len(fields) == 4:
		[url,title,claim,context] = fields
		domain = get_domain(url)
		add_claim(domain,claim)
	
def add_claim(domain,claim):
	if domain in domainclaims:
		claims = domainclaims[domain]
		for otherclaim in claims:
			if otherclaim.find(claim) != -1:
				return
			elif claim.find(otherclaim) != -1:
				claims.remove(otherclaim)
				claims.append(claim)
				return
		claims.append(claim)	
	else:
		domainclaims[domain] = [claim]

def print_claims():
	for domain,claims in domainclaims.iteritems():
		for claim in claims:
			print domain + "\t" + claim

def main():
	for line in fileinput.input():
		add_line(line)
	print_claims()

if __name__ == '__main__':
	main()
