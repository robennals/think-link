"""
Generate csv files to be used as input for Amazon Mechanical Turk.
"""

import re
import random
import csv
import sys

goodclaim = re.compile("[a-zA-Z\s,'\"\$\d]+$")
def is_good(claim): return goodclaim.match(claim) and len(claim) < 70

def load_claims(filename): return [line.strip().lower() for line in file(filename) if is_good(line)]
def load_messy_claims(filename): return [line.strip() for line in file(filename) if not is_good(line)]

good_gold = load_claims("good_claims_gold.txt")
bad_gold = load_claims("bad_claims_gold.txt")
all_claims = load_claims("shuffled_claims.claims")

def main():
	writer = csv.writer(sys.stdout,delimiter=",",quotechar='"',quoting=csv.QUOTE_ALL,escapechar='\\')
	writer.writerow(["snip"+str(i) for i in range(1,11)])
	for i in range(0,len(all_claims)/8):
		good = good_gold[random.randint(0,len(good_gold)-1)]
		bad = bad_gold[random.randint(0,len(bad_gold)-1)]
		claims = all_claims[(i*8):(i*8)+8] + [good,bad]
		random.shuffle(claims)
		writer.writerow(claims)
		
if __name__ == '__main__':
	main()

