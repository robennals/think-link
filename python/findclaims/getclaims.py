
import re
import urllib2
import makedb.mapreduce as mapreduce
import nlptools

quotedprefix = re.compile('\"([\w\s]*)\"')

def main(args):
	process_urls_from_file(args[1],args[2])
	
def process_urls_from_file(filename,outname):	
	outstore = mapreduce.OutStore(outname)
	for line in file(filename):
		(date,url,query) = [nlptools.trim_ends(x) for x in line.split("\t")]
		print "url",url
		process_url(outstore,date,url,query)			

def process_url(outstore,date,url,query):
	try:		
		content = urllib2.urlopen(url,None,4).read(400000)
		process_content(outstore,date,url,query,content)
	except Exception as e:
		print "    error",e

def process_content(outstore,date,url,query,content):
	prefix = quotedprefix.search(query).group(1)
	regexp = re.compile(prefix.replace(" ","\s+"),re.I)
	for m in regexp.finditer(content):
		aftertext = content[m.end():m.end()+500]
		#sentence = ss.first_sentence(aftertext)
		sentence = aftertext
		prefix = content[m.start():m.end()]
		# print "    claim: <"+prefix+">",sentence[0:60]
		outstore.emit(url,{'date':date,'prefix':prefix,'sentence':sentence})
	

if __name__ == "__main__":
	main(sys.argv)

