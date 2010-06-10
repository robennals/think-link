
from nltk.corpus import wordnet as wn

def is_synonym(worda,wordb):
	synsets_a = wn.synsets(worda)
	synsets_b = wn.synsets(wordb)
	return len(set(synsets_a) & set(synsets_b)) > 0

def similarity(worda,wordb):
	if is_synonym(worda,wordb): return 1.0
	synsets_a = wn.synsets(worda)
	synsets_b = wn.synsets(wordb)
	best = 0.0
	for a in synsets_a:
		for b in synsets_b:
			distance = a.path_similarity(b)
			if distance > best:
				best = distance
	return best		

def similarity2(worda,wordb):
	if is_synonym(worda,wordb): return 1.0
	synsets_a = wn.synsets(worda)
	synsets_b = wn.synsets(wordb)
	best = 0.0
	for a in synsets_a:
		for b in synsets_b:
			distance = a.wup_similarity(b)
			if distance > best:
				best = distance
	return best		

			
			
