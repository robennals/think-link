#!/usr/bin/env python
# encoding: utf-8

"""
Manage a database for claims
"""

#from pysqlite2 import dbapi2 as sqlite
import MySQLdb as mysql


#def getPagesDb():
	#connection = sqlite.connect("pages.db")
	#cursor = connection.cursor()
	#return cursor

def getClaimDb():
	connection = mysql.connect (
					host = "localhost",
					user = "thinklink",
					db = "claimfinder",
					passwd = "zofleby")
	return connection
					
	
