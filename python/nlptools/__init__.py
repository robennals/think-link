
import csv
import re

def remove_exact_duplicates(strings):
	strings.sort()
	unique = []
	for i in range(0,len(strings)-1):
		if not claims[i+1] == strings[i]:
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
	
