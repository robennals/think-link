from makedb.makedb import escape
import trimoptions as t

def make_datafile(instore,outfile):
	for item in instore:
		url,key2,data = item
		outfile.write((url+"\t"+data['date']+"\t"+escape(data['prefix'])+"\t"+escape(data['sentence'])+'\n').encode("utf8"))
	outfile.close()

def make_trimmed_datafile(instore,outfile):
	for item in instore:
		url,key2,data = item
		if not "error" in data and not t.is_bad(t.fixstring(data['sentence'])) and not t.is_crap(data['sentence']):
			trimmed = t.simple_trim(t.fixstring(data['sentence']))
			outfile.write((url+"\t"+data['date']+"\t"+escape(data['prefix'])+"\t"+escape(trimmed)+"\t"+escape(data['sentence'])+'\n').encode("utf8"))
	outfile.close()

def make_trimmed_claimlist(instore,outfile):
	for item in instore:
		url,key2,data = item
		if not "error" in data and not t.is_bad(t.fixstring(data['sentence'])) and not t.is_crap(data['sentence']):
			trimmed = t.simple_trim(t.fixstring(data['sentence']))
			outfile.write((escape(trimmed)+"\n").encode("utf-8"))
	outfile.close()
