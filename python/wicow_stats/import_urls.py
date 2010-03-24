#!/usr/bin/env python
# encoding: utf-8

"""
Go through the output from Yahoo BOSS and store it in a SQL database.
"""

import claimdb
import fileinput
import sys
from pysqlite2 import dbapi2 as sqlite

def main():
	connection = claimdb.getClaimDb()
	cursor = connection.cursor()
	for line in fileinput.input():
		url = line.strip().split("\t")[0]
		cursor.execute("INSERT IGNORE INTO page (url) VALUES (%s)",[url])
	cursor.close()
	connection.close()	
		
if __name__ == '__main__':
	main()

			
