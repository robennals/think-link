
import csv
import re
import os
import operator as op

def remove_exact_duplicates(strings):
	strings.sort()
	unique = []
	for i in range(0,len(strings)-1):
		if not strings[i+1] == strings[i]:
			unique.append(strings[i])
	return unique

def csv_writer(outfile):
	return csv.writer(outfile,delimiter="\t",quotechar='"',quoting=csv.QUOTE_ALL,escapechar='\\')

def csv_reader(infile):
	return csv.reader(infile,delimiter="\t",quotechar='"',quoting=csv.QUOTE_ALL,escapechar='\\')

def trim_to_words(text):
	words = text.split(" ")
	return " ".join(words[1:-1])
	
pat = re.compile("\s+")
def normalize_space(text):
	return pat.sub(" ",text)

spaceend = re.compile("(^\s+)|(\s+$)")
def trim_ends(text):
	return spaceend.sub("",text)

nonword = re.compile("[^\w\s]")
def normalize_text(text):
	return trim_ends(nonword.sub("",normalize_space(text).lower()))

def suffixes(list):
	return [list[i:] for i in range(0,len(list))]

def words(text):
	return text.split(" ")

def string_to_filename(text):
	return nonword.sub("",text.replace(" ","_"))	

def string_to_filename_dir(text):
	return nonword.sub("",text.replace(" ","/"))
	
def local_filename(thisfile,thatfile):
	return os.path.join(os.path.dirname(thisfile),thatfile)

def sorted_freqs(freqs):
	return sorted(freqs.iteritems(),key=op.itemgetter(1),reverse=True)

#def tag_sentence(sentence):
	#return nltk.pos_tag(nltk.word_tokenize(sentence))

def convert_entities(text):
	return text.replace("&#8217;","'").replace("&#8220;",'"').replace("&#8221;",'"').replace("&#8230;"," - ").replace("&nbsp;"," ").replace("&amp;","&").replace("&ldquq;",'"').replace("&rdquo;",'"').replace("&acute;","'").replace("&mdash;","-").replace("&quot;","'").replace("&#039;","'").replace("&#39;","'").replace("&#8212;","-").replace("&#8216;","'").replace("&lsquo;","'").replace("&rsquo;","'").replace("&ldquo;",'"').replace("&rdquo;",'"').replace("&#8211","").replace("&#038;","").replace("&#038;","").replace("&#147;",'"').replace("&#8220;",'"').replace("&#34;",'"').replace("&#130;",",").replace("&#133;","...").replace("&#145;","'").replace("&#034;",'"')

def is_verb(name):
    return len([synset for synset in wn.synsets(name) if ".v." in synset.name]) > 0

def is_past_verb(name):
	return name == "s" or (is_verb(name) and (name.endswith("s") or name.endswith("ed")))
	
def get_domain(url):
	m = re.search("https?://([\w\.]+)",url)
	if m:
		return m.group(1)
	else:
		return url

def hash_freqs(list):
	counts = {}
	for item in list:
		counts[item] = counts.get(item,0) + 1
	return counts

def count_freqs(list):
	counts = {}
	for item in list:
		counts[item] = counts.get(item,0) + 1
	return sorted(counts.iteritems(),key=op.itemgetter(1),reverse=True)
