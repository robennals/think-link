#!/usr/bin/env python
# encoding: utf-8
"""
Created by Dan Byler on 2009-11-21.

Clusters lines from a text file; outputs to image.

Known bugs:
- Method A still doesn't work
- Problem if a document is shorter than the "title" length

To do:
- Populate to-do list

"""

import sys, os, string, numpy, re
from math import log, sqrt
from itertools import combinations
import nltk
import hclustercode

## trick to make unicode() work (via John)
reload(sys)
sys.setdefaultencoding('utf-8')

porter = nltk.PorterStemmer()
allstopwords = nltk.corpus.stopwords.words('english') + ['','ET','\'', 'falsely', 'claimed', 'woman', 'man', 'politics', 'environment', 'world','think', 'progress','foxnews.com', 'newsvine','realclearpolitics','factcheck.org','article','cnn']

def get_documents(sourcedoc):
	"""Reads source text file; returns list of strings, one per line"""
	texts = []
	f = open(sourcedoc, 'r')
	i = 0
	for line in f:
		texts.append(line)
	return [{"text": text}
			 for i, text in enumerate(texts)]

def tokenize(documents, tokendict):
	"""Tokenize documents"""
	transtable = string.maketrans('','')
	i = 0
	for item in documents:
		item['tokens'] = []
		for word in item['text'].split():
			word = word.translate(transtable, string.punctuation).lower()
			if word not in allstopwords:
				token = porter.stem(word)
				item['tokens'].append(token)
				if token not in tokendict:
					tokendict[token] = i
					i += 1
	return

def add_tfidf_to(documents):
	"""Adds TF/IDF element to document dictionary"""
	tokens = {}
	for id, doc in enumerate(documents):
		tf = {}
		doc["tfidf"] = {}
		doc_tokens = doc.get("tokens", [])
		for token in doc_tokens:
			tf[token] = tf.get(token, 0) + 1
		num_tokens = len(doc_tokens)
		if num_tokens > 0:
			for token, freq in tf.iteritems():
				tokens.setdefault(token, []).append((id, float(freq) / num_tokens))
	
	doc_count = float(len(documents))
	for token, docs in tokens.iteritems():
		idf = log(doc_count / len(docs))
		for id, tf in docs:
			tfidf = tf * idf
			if tfidf > 0:
				documents[id]["tfidf"][token] = tfidf
	# Normalize
	for doc in documents:
		doc["tfidf"] = normalize(doc["tfidf"])
	

def populate_features(documents, tokendict, use_tf=True):
	"""Turn docs into a (sparse) matrix.
		
	If use_tf, uses TF/IDF values for matrix population. Otherwise uses binary 1/0 for term"""
	tlen = len(tokendict)
	dlen = len(documents)
	features = numpy.zeros((dlen, tlen))
	for i in range(dlen):
		if use_tf:
			for term in documents[i]['tokens']:
				# print term
				features[i][int(tokendict[str(term)])] = documents[i]['tfidf'][term]
		else:
			for term in documents[i]['tokens']:
				features[i][int(tokendict[str(term)])] = 1
	return features

def printchildrenids(cluster, id, fulltext=False, thedoc=''):
	"""Gets displays children IDs. Used for debugging"""
	if cluster.id == id:
		print 'this cluster: ' + str(cluster.id) + '; distance: ' + str(cluster.distance)
		if cluster.left!=None: print "left: " + str(cluster.left.id)
		if fulltext: print thedoc[cluster.left.id]['tokens']
		if cluster.right!=None: print "right: " + str(cluster.right.id)
		if fulltext: print thedoc[cluster.right.id]['tokens']
	else:
		if cluster.left!=None: printchildrenids(cluster.left, id, fulltext, thedoc)
		if cluster.right!=None: printchildrenids(cluster.right, id, fulltext, thedoc)

################
def tfidf_cosine_dist(a, b):
	"""Used by get_distance_graph"""
	cos = 0.0
	a_tfidf = a["tfidf"]
	for token, tfidf in b["tfidf"].iteritems():
		if token in a_tfidf:
			cos += tfidf * a_tfidf[token]
	return cos

def normalize(features):
	"""Optional for add_tfidf_to method"""
	norm = 1.0 / sqrt(sum(i**2 for i in features.itervalues()))
	for k, v in features.iteritems():
		features[k] = v * norm
	return features

def majorclust(graph):
	"""Attempts to find groups of clusters"""
	cluster_lookup = dict((node, i) for i, node in enumerate(graph.nodes))
		
	count = 0
	movements = set()
	finished = False
	while not finished:
		finished = True
		for node in graph.nodes:
			new = choose_cluster(node, cluster_lookup, graph.edges)
			move = (node, cluster_lookup[node], new)
			if new != cluster_lookup[node] and move not in movements:
				movements.add(move)
				cluster_lookup[node] = new
				finished = False
				
	clusters = {}
	for k, v in cluster_lookup.iteritems():
		clusters.setdefault(v, []).append(k)
		
	return clusters.values()

def choose_cluster(node, cluster_lookup, edges):
	"""Used by majorclust to select clusters"""
	new = cluster_lookup[node]
	if node in edges:
		seen, num_seen = {}, {}
		for target, weight in edges.get(node, []):
			seen[cluster_lookup[target]] = seen.get(
				cluster_lookup[target], 0.0) + weight
		for k, v in seen.iteritems():
			num_seen.setdefault(v, []).append(k)
		new = num_seen[max(num_seen)][0]
	return new

def get_distance_graph(documents):
	"""Generates distance graph of documents"""
	class Graph(object):
		def __init__(self):
			self.edges = {}
		
		def add_edge(self, n1, n2, w):
			self.edges.setdefault(n1, []).append((n2, w))
			self.edges.setdefault(n2, []).append((n1, w))
		
	graph = Graph()
	doc_ids = range(len(documents))
	graph.nodes = set(doc_ids)
	for a, b in combinations(doc_ids, 2):
		graph.add_edge(a, b, tfidf_cosine_dist(documents[a], documents[b]))
	# print graph.edges
	return graph

def graph_to_array(distgraph):
	"""NOT FINISHED: convert graph to regular array"""
	distarray = []
	for i in (distgraph):
		distarray[i] = [distgraph[i][0][j][1] for j in distgraph[i][0]]
	return distarray

def printclusttext(clust, documents, labels=None,n=0):
	"""Prints entire cluster"""
	# indent to make a hierarchy layout
	for i in range(n): print ' ',
	if clust.id<0:
			# negative id means that this is branch
			print '-', str(clust.id), '; dist: '+ str(clust.distance)
	else:
			# positive id means that this is an endpoint
			if labels==None: print clust.id, documents[clust.id]['text']
			else: print labels[clust.id]
		
	# now print the right and left branches
	if clust.left!=None: printclusttext(clust.left, documents, labels=labels,n=n+1)
	if clust.right!=None: printclusttext(clust.right, documents, labels=labels,n=n+1)

def promoteclusters(clust, documents, result, threshold=1.00, labels=None, n=0):
	# promotes close cluster matches
	if clust.id<0:
		# negative id means that this is branch
		if clust.distance < threshold:
			# print str(clust.id), str(clust.distance)
			result.append(clust)
	if clust.left!=None: promoteclusters(clust.left, documents, result, labels=labels,n=n+1)
	if clust.right!=None: promoteclusters(clust.right, documents, result, labels=labels,n=n+1)
	return

def printreducedcluster(clust, documents, threshold=1.00, labels=None,n=0):
	# Prints a reduced cluster output
	for i in range(n): print ' ',
	if clust.id<0:
			# negative id means that this is branch
			print '-' + str(clust.id) + ' ' + str(clust.distance)
	else:
			# positive id means that this is an endpoint
			if labels==None: print clust.id
			else: print labels[clust.id]
	
	# now print the right and left branches
	if clust.left!=None and clust.left.distance <= threshold: printreducedcluster(clust.left, documents, labels=labels,n=n+1)
	if clust.right!=None and clust.right.distance <= threshold: printreducedcluster(clust.right, documents, labels=labels,n=n+1)

################
def getwordcounts(fileline):
	wc={} 
	# Loop over all the entries 
	title = fileline[:30]
	for word in fileline:  #Text processing here
		wc.setdefault(word, 0)
		wc[word]+=1
	return d.feed.title,wc

def getwords(html):
	# Remove all the HTML tags 
	txt=re.compile(r'<[^>]+>').sub('',html) 
	# Split words by all non-alpha characters 
	words=re.compile(r'[^A-Z^a-z]+').split(txt) 
	# Convert to lowercase 
	return [word.lower() for word in words if word!='']

def getstringwordcounts(mystring):
	transtable = string.maketrans('','')
	mystring = mystring.expandtabs()
	title = mystring[:50]
	wc = {}
	for word in mystring.split():
		word = word.translate(transtable, string.punctuation).lower()
		if word not in allstopwords:
			word = porter.stem(word)
			wc.setdefault(word,0)
			wc[word]+=1
	return title,wc

def main(args):
	# Settings
	sourcedoc = 'abstracts10.txt'
	method = 1
		
	#_____ Method 1 _____#
	# Produces bad results
	if method == 1:
		tokendict = {}							#initialize master term dictionary
		documents = get_documents(sourcedoc)	#get the documents
		
		docnames = []							#extract 45 chars for document identification
		for i in documents:
			docnames.append(i['text'][:45])
		
		tokenize(documents, tokendict)			#add tokens to doc, populate tokendict
		add_tfidf_to(documents)					#add tfidf to docs
		
		## populate features matrix. True-->use TF/IDF
		features = populate_features(documents, tokendict)
		
		## generate tree
		tree = hclustercode.hcluster(features)		#cosine_distance is slow!
		
		# draw dendogram
		# hclustercode.drawdendrogram(tree,docnames,'dendr000.jpg')
		
		## promote clusters
		promoted = []
		promoteclusters(tree, documents, promoted)
		for i in range(len(promoted)):
			name = 'dendr%03d.jpg' % i
			print name
			print documents[promoted[i].id]['text']
			# hclustercode.drawdendrogram(promoted[i], docnames,name)
	
		## Debug code
		# printclusttext(tree, documents)	 #prints documents
		# printchildrenids(tree, -2, True, documents)


	#_____ Method 2: Prepare document matrix, called in method 3 _____#
	if method == 2:
		apcount={}						# number of documents the word appeared in
		wordcounts={}					# number of appearances of the word
		for line in file(sourcedoc):
			title,wc=getstringwordcounts(line)
			wordcounts[title]=wc
			for word,count in wc.items():
				apcount.setdefault(word,1)
				if count>1:
					apcount[word]+=1
		wordlist=[]
		for w,bc in apcount.items(): 
			frac=float(bc)/len(wc) 
			if frac>0.1 and frac<0.5: wordlist.append(w)   #weeds out
			# wordlist.append(w)
		out=file('wordcountmatrix.txt','w') 
		out.write('Doc')
		for word in wordlist: out.write("\t%s" % word)
		out.write('\n')
		for doc,wc in wordcounts.items(): 
			out.write(doc)
			for word in wordlist: 
				out.write("\t%d" % wc.get(word,0))
			out.write("\n") 

	#_____ Method 3: Use document matrix created in method 2 _____#
	if method == 3:
		filenames,words,data=hclustercode.readfile('wordcountmatrix.txt')
		# print filenames
		tree=hclustercode.hcluster2(data)
		# printclusttext(clust)
		hclustercode.drawdendrogram(tree,filenames)
		
		
		
	# Create distance graph matrix
	# dist_graph = get_distance_graph(documents)
	# print dist_graph.edges
		
	# unused:
	# # # Someday: map in 2D space	# # # # # #
	# dist_array = graph_to_array(dist_graph) #
	# print dist_array						  #
	# # # # # # # # # # # # # # # # # # # # # #

	
	# Future things to try
		# # ATTEMPT TO WEED OUT POOR PERFORMERS
		# for base in range(len(dist_graph.edges)):
		#	print "base = " + str(base)
		#	basekeep = False
		#	while basekeep == False:
		#		for rel in dist_graph.edges[base]:
		#			print rel
		#			if rel[1] > .15:
		#				print rel[1]
		#				basekeep = True
		#				print 'yeah! ******'
		# # # print dist_graph.edges[base], basekeep

		# # # # # # Someday: 2D space mapping # # # # # #
		# coords=hclustercode.scaledown(dist_graph.edges)
		# hclustercode.draw2d(coords, docnames)
		# # # # # # # # # # # # # # # # # # # # # #

	
		##	extract clusters
		# x2 = hclustercode.extract_clusters(tree, 1.4)
		# print len(x2)
		# # for i in range(len(x2)):
		# #		printclusttext(x2[i], documents)
		# printclusttext(x2[13], documents)
	
		# for i in range(len(x2)):
		#	print documents[x2[i].id]['text'] # documents[int(x2[i])]
		# print documents[:20]

		# tree2 = hcluster.features
	
	
	
		# ##### Official Hcluster method debug code
		# print dist_graph.edges
		# print hcluster.is_valid_dm(dist_graph.edges)
	

		# sort by similarity rank ((rating, index1, index2))
		# thesorted = []
		# for i in dist_graph.edges.keys():
		#	for item in dist_graph.edges[i]:
		#		# print (item[1],i,item[0])
		#		thesorted.append((item[1],i,item[0]))
		# thesorted.sort(reverse=True)
		# print thesorted

		# # Display results
		# for i in thesorted:
		#	if i[0] > 0.1:
		#		print i[0],
		#		index = i[1]
		#		print documents[index]['text']
	
	
		# for cluster in majorclust(dist_graph):
		#	print "========="
		#	for doc_id in cluster:
		#		print documents[doc_id]
		#		print documents[doc_id]["text"]

if __name__ == '__main__':
	main(sys.argv)
