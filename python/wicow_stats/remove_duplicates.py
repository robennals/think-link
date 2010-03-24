#!/usr/bin/env python
# encoding: utf-8

"""
Given a file, remove lines that contain exactly the same text
"""

import nltk
import sys
import fileinput

import claimfinder as cf

def remove_exact_duplicates(claims):
	claims.sort()
	unique = []
	for i in range(0,len(claims)-1):
		if not claims[i+1] == claims[i]:
			unique.append(claims[i])
	return unique

def main():
	claims = [line.strip() for line in fileinput.input()]
	good = remove_exact_duplicates(claims)
	for claim in good:
		print claim
			
	
if __name__ == '__main__':
	main()
