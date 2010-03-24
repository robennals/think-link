"""
Given a file that contains all known good claims, and a file input
filter out all the lines that are not in the known good set.
"""

import filter_claims as f

good_claim_file = "../output/only_good_claims.claims"

def load_good_claims(filename):
	good = set([])
	counter = 0
	for line in file(filename):
		line = line.strip()
		line = f.cleanup(line)
		counter += 1
		if counter % 5000 == 0:
			print counter
		good.add(line)
	return good
	
def filter_good_claims(filename,good):
	outfile = file(filename.replace(".unique",".nlpgood"),"w")
	for line in file(filename):
		line = line.strip()
		line = f.cleanup(line)
		if line in good:
			outfile.write(line+"\n")
	outfile.close()
	
			
			
	
		
	

