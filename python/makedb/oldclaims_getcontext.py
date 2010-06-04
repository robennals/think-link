
from urlcheck.matcher import basematcher
import os
import wicow_stats.claimfinder as cf
from django.utils.encoding import smart_str, smart_unicode, force_unicode

seen = set()

def fix_string(txt):
	txt = cf.convert_entities(txt)
	txt = cf.convert_unicode(txt)
	return txt.decode('utf-8')

def oldclaims_getcontext(infile,outfile):
	for line in infile:
		line = fix_string(line)
		url,title,claim,context = line.strip().split("\t")
		claim = claim.replace(" '"," ").replace("' "," ").replace('"',"").replace("[","").replace("]","").replace("(","").replace(")","")
		claim = claim.replace("-"," ").replace("/"," ")
		maybeclaims = basematcher.match_with_claims(claim)
		for word,trimmedclaim,claimcontext in maybeclaims: 
			if trimmedclaim in claim and not trimmedclaim in seen:
				outfile.write((url+"\t"+title+"\t"+trimmedclaim+"\t"+context+"\n").encode("utf-8"))
				seen.add(trimmedclaim)

def oldclaims_allfiles(inpath,outfile):
	for filename in allfiles_with_extension(inpath,".claims"):
		print filename
		oldclaims_getcontext(file(filename),outfile)
		
	
	
def get_allfiles(path):
	children = os.listdir(path)
	subfiles = [get_allfiles(os.path.join(path,n)) for n in children if os.path.isdir(os.path.join(path,n))]
	directfiles = [os.path.join(path,n) for n in children if os.path.isfile(os.path.join(path,n))]
	return sum(subfiles,directfiles)
			
def allfiles_with_extension(path,extension):
	allfiles = get_allfiles(path)
	return [f for f in allfiles if f.endswith(extension)]
	
	
