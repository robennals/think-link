#!/usr/bin/python

# transformation steps: 
# - remove punctuation and lowercase, 
# - remove stop words,
# - word stemming, 
# - ?? replace each word with its sense: first sense, first lemma_name (do for nouns and adjectives)

"""Transform claim pkl into two claim pkls with different normalizations:
Usage: python transform_snippets.py input_claim.pkl output_1.pkl output_2.pkl
"""

import nltk,string,pickle,sys
from extract_training import *
from nltk.corpus import wordnet as wn

if (len(sys.argv)) < 4: sys.exit("Usage: python transform_snippets.py input_claim.pkl output_1.pkl output_2.pkl")

stemmer = nltk.stem.PorterStemmer()
stopwords = nltk.corpus.stopwords.words('english')
mapping = nltk.defaultdict(lambda: 'n')
mapping_entries = {"JJ":"a","VBD":"v","VB":"v","VBG":"v","VBN":"v","VBZ":"v"}
for k,v in mapping_entries.iteritems(): mapping[k] = v

def tokenize(text_str):
    try: tokens = nltk.word_tokenize(str(text_str).translate(string.maketrans("",""), string.punctuation))
    except: tokens = []
    return tokens

def normalize_snippet(text_str):
    tokens = tokenize(text_str)
    clean_text = [stemmer.stem(w) for w in tokens if w.lower() not in stopwords]
    return " ".join(clean_text)

def normalize_snippet_wn(text_str):
    tokens = tokenize(text_str)
    tags = nltk.pos_tag(tokens)
    clean_text = [wn_morph_helper(entry[0],mapping[entry[1]]) for entry in tags if entry[0].lower() not in stopwords]
    return " ".join(clean_text)

def wn_morph_helper(text_str,pos):
    ret = wn.morphy(text_str,pos)
    if (ret==None): return text_str
    else: return ret

def normalize_claim(claim_json,wn=0):
    if wn:
        new_yes = [normalize_snippet_wn(y) for y in claim.yes_abstract]
        new_no = [normalize_snippet_wn(y) for y in claim.no_abstract]
    else:
        new_yes = [normalize_snippet(y) for y in claim.yes_abstract]
        new_no = [normalize_snippet(y) for y in claim.no_abstract]
    claim_json.yes_abstract = new_yes
    claim_json.no_abstract = new_no
    return claim_json

def read_input(filename):
    f = open(filename,'r')
    return pickle.load(f)

def write_output(filename,pkl):
    f = open(filename,'w')
    pickle.dump(pkl,f)

print "Writing porter stemmed claim"
claim = read_input(sys.argv[1])
write_output(sys.argv[2],normalize_claim(claim,0))
print "Writing wordnet stemmed claim"
claim = read_input(sys.argv[1])
write_output(sys.argv[3],normalize_claim(claim,1))
