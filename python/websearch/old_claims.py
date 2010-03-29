
"""
Create a short term claim set from the set of claims we used in the disputefinder toolbar.
"""

import csv
import re

def mysql_reader(f):
	return csv.reader(f,doublequote=False,escapechar='\\',quoting=csv.QUOTE_ALL)

def get_old_claims():
	basic_claims = [(row[0],row[0]) for row in mysql_reader(file("websearch/old_claims.csv"))]
	paraphrases = [(row[0],row[1]) for row in mysql_reader(file("websearch/old_paraphrases.csv"))]
	goodclaims = [(row.strip(),row.strip()) for row in file("websearch/good_claims.txt")]
	return basic_claims + paraphrases + goodclaims
	
	
	
