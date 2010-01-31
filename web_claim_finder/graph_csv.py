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

base = "../output/claimfinder/urlphrases_date/"
years = range(2000,2011)
cols = 10
writer = csv.writer(sys.stdout,delimiter=",",quotechar='"')



allfreqs = {}
yearfreqs = {}

def add_yearfreqs(year):
	freqfile = file(base+"January_10_"+str(year)+".freqs")
	freqs = {}
	for line in freqfile:
		word,count = line.split("\t")
		count = int(count)
		if not word in cf.stopwords:
			freqs[word] = count
			allfreqs[word] = max(allfreqs.get(word,0),count)
	yearfreqs[year] = freqs
		
def get_topwords():
	topwordfreqs = sorted(allfreqs.iteritems(),key=op.itemgetter(1),reverse=True)
	topwords = [tuple[0] for tuple in topwordfreqs]
	return topwords[0:cols]
	
def do_csv_graph(keysandnames):
	keys = [keysandnames]
	for year in years:
		add_yearfreqs(year)
	topwords = get_topwords()
	topwords.reverse()
	writer.writerow(['word']+topwords)
	for year in years:
		cols = [yearfreqs[year].get(word,0) for word in topwords]	
		writer.writerow([year]+cols)
 
if __name__ == '__main__':
	main()
