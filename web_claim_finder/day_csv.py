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

def mkmonth(month,days,year): 
	return [month + " " + str(day) + " " + str(year) for day in range(1,days+1)]

#days = mkmonth("October",31,2009) + mkmonth("November",30,2009) + mkmonth("December",31,2009) + mkmonth("January",19,2010)
days = mkmonth("November",30,2009)

cols = 10
writer = csv.writer(sys.stdout,delimiter=",",quotechar='"')

allfreqs = {}
dayfreqs = {}

def add_datefreqs(date):
	freqfile = file(base+date.replace(" ",'_')+".freqs")
	freqs = {}
	for line in freqfile:
		word,count = line.split("\t")
		count = int(count)
		if not word in cf.stopwords:
			freqs[word] = count
			allfreqs[word] = max(allfreqs.get(word,0),count)
	dayfreqs[date] = freqs
		
def get_topwords():
	topwordfreqs = sorted(allfreqs.iteritems(),key=op.itemgetter(1),reverse=True)
	topwords = [tuple[0] for tuple in topwordfreqs]
	return topwords[0:cols]
	
def main():
	for day in days:
		add_datefreqs(day)
	topwords = get_topwords()
	topwords.reverse()
	writer.writerow(['word']+topwords)
	for day in days:
		cols = [dayfreqs[day].get(word,0) for word in topwords]	
		writer.writerow([day]+cols)
 
if __name__ == '__main__':
	main()
