
import re
import fileinput
import filter_claims as f

goodclaimfilename = "/home/rob/git/thinklink/output/wiki_filtered_claims6.claims"

goodclaims = set([line.strip() for line in file(goodclaimfilename)])

def main():
	for line in fileinput.input():
		row = line.strip().split("\t")
		claim = row[2]
		shortclaim = f.cleanup(claim)
		row[2] = shortclaim
		if shortclaim in goodclaims:
			print "\t".join(row)

if __name__ == '__main__':
	main()
