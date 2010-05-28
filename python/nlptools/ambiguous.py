
import csv
import nltk
import wicow_stats.filter_claims as f
import nlptools as nt

labelfilename = "../output/labelled/unique_claims_10000_labelled.csv"
scoredfilename = "../output/labelled/justscores2.claims"

labelled = [row for row in csv.reader(file(labelfilename),delimiter="\t",quotechar='"',quoting=csv.QUOTE_ALL)]
scored = [row for row in csv.reader(file(scoredfilename),delimiter="\t")]

zipped = [(labelled[i][0],float(scored[i][0]),scored[i][1]) for i in range(0,len(scored)-1)] 

labelled_good = [row for row in zipped if row[0] == "G"]
labelled_ambig = [row for row in zipped if row[0] == "A"]
labelled_maybe = [row for row in zipped if row[0] == "M"]

threshold = 0.10

badwords = set(["these","he","she","it","we","i","them","he's","you're"])
badfirstwords = set(["they","he","she","it","i"])

def classify_good_badwords(row):
	score = row[1]
	text = row[2]
	words = nltk.word_tokenize(text)
	return set(words).isdisjoint(badwords) and not words[0] in badfirstwords 

def classify_good_both(row):
	return classify_good_wiki(row) and f.is_good(nt.trim_ends(row[2]))

def classify_wiki_badwords(row):
	return classify_good_badwords(row) and classify_good_wiki(row)

classify_good = classify_good_wiki

def classify_good_wiki(row):
	score = row[1]
	text = row[2]
	return (score > threshold)

good_yes = [row for row in zipped if row[0] == "G" and classify_good(row)]
good_no = [row for row in zipped if row[0] == "G" and not classify_good(row)]
ambig_yes = [row for row in zipped if row[0] == "A" and classify_good(row)]
ambig_no = [row for row in zipped if row[0] == "A" and not classify_good(row)]

prop_good_yes = float(len(good_yes))/len(labelled_good)
prop_ambig_yes = float(len(ambig_yes))/len(labelled_ambig)

precision = float(len(good_yes))/(len(good_yes)+len(ambig_yes))
recall = prop_good_yes		
	
base_ratio = float(len(labelled_good))/(len(labelled_good)+len(labelled_ambig))
