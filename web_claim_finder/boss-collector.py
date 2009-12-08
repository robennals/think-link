#!/usr/bin/env python
# encoding: utf-8
"""
Created by Dan Byler on 2009-11-21.

Collects BOSS search results, dumps title/abstract into text file

To do:
- Grab text from website instead of just abstract
- Store in a better format

"""

import sys, os
from bingapi import bossapi
import simplejson as json
# from yos.yql import db
# try: import json
# except ImportError: import simplejson as json
# import codecs


## obscure trick to make unicode() work, via Mike
reload(sys)
sys.setdefaultencoding('utf-8')


def outputWrite(string):
	"""Prints to string and file"""
	output_file = "abstracts.txt"
	f = open(output_file, 'a')
	f.write(string)
	f.close()
	# print string

def main():
	bosskey = 'Iotq.ZzV34GGwR2lUpZAS0emHJIoCbb9OWYiFKcraOrNUmv.dGjfc3qRDCkMnyJQGj0-'
	boss = bossapi.Boss(bosskey)
	def_count = 50			# Results per search iteration
	the_start = 0			# Starting search location
	needed_results = 1000		# Total results needed
	print "Logging abstracts..."
	my_start = the_start
	while True:
		if my_start - the_start < needed_results:
			a = boss.do_web_search('falsely claimed that', count=def_count, start=my_start, style='raw', view='keyterms', type='-msoffice')
			# print a
			item_id = my_start
			for i in a[u'ysearchresponse'][u'resultset_web']:
				print '%i %s [%s]' % (item_id, i[u'title'], i[u'url'])
				outputWrite(i[u'title']+'\t'+i[u'abstract']+'\n')
				item_id += 1
			my_start += def_count
			# table = db.create(data=a)
			# print db.rows
		else:
			return

if __name__ == '__main__':
	main()
