#!/usr/bin/env python
# encoding: utf-8

"""
Generate a graph, showing how different nouns rose and fell in different years.
"""
import io
import csv
import sys
import operator as op
import claimfinder as cf
import os

base = "../output/claimfinder/urlphrases_date/"
years = range(2000,2010)
cols = 10
writer = csv.writer(sys.stdout,delimiter=",",quotechar='"')



allfreqs = {}
yearprops = {}

def add_yearfreqs(year):
	freqs = {}
	total = float(os.popen("cat "+base+"*_"+str(year)+".good | wc -l").next()) 
	for day in range(1,32):
		freqfile = file(base+"January_"+str(day)+"_"+str(year)+".freqs")
		for line in freqfile:
			word,count = line.split("\t")
			count = int(count)
			if not word in cf.stopwords:
				freqs[word] = freqs.get(word,0) + count
				allfreqs[word] = max(allfreqs.get(word,0),count)
	props = {}
	for word in freqs.keys():
		props[word] = freqs[word] / total
	yearprops[year] = props
		
def get_topwords():
	topwordfreqs = sorted(allfreqs.iteritems(),key=op.itemgetter(1),reverse=True)
	topwords = [tuple[0] for tuple in topwordfreqs]
	return topwords[0:cols]
	
def main():
	for year in years:
		add_yearfreqs(year)
	topwords = get_topwords()
	topwords.reverse()
	writer.writerow(['word']+topwords)
	for year in years:
		cols = [yearprops[year].get(word,0) for word in topwords]	
		writer.writerow([year]+cols)
 
if __name__ == '__main__':
	main()
