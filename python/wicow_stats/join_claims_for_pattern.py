
import patterns as pats

import os

basewild = "../output/claimfinder/urlphrases_date/*/"

outpath = "../output/claimfinder/phrases_joined/"
	
def main():	
	for pattern in pats.prefix_patterns:
		print "--",pattern,"--"
		pathpat = pattern.replace(" ","_")
		filewild = basewild+pathpat+".claims"
		joinfile = outpath+pathpat+".claims"
		uniqfile = outpath+pathpat+".unique"
		os.system("cat "+filewild+" > "+joinfile)
		os.system("python remove_duplicates.py <"+joinfile+" >"+uniqfile)
	
		
if __name__ == '__main__':
	main()
