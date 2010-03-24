#!/usr/bin/env python
# encoding: utf-8

"""
Do simple aglomerative clustering of claims, based on the nouns they contain.

(should we also do based on all words?)

1.) Create clusters for each word, with each cluster containing all phrases that contain the word
2.) Calculate the distance from all clusters, and merge the clusters with the most claim overlap
3.) Iterate until we have the right number of clusters
"""

import fileinput
import operator as op
import nltk
import sys

def create_initial_clusters(noun,infile):
	clusters = {}
	i = 0  # identify claims by int to make compare faster
	for line in file(infile):
		i += 1
		words = line.split("\t")[0].split(" ")
		if noun in words and not ("<" in line): 
			for word in words:
				if word != noun and word.isalpha():
					claimset = clusters.get(word,set())
					claimset.add(i)
					clusters[word] = claimset
	return clusters

def cluster_similarity(x,y):
	return float(len(x.intersection(y)))/len(x.union(y))	

def compare_cluster_size(x,y):
	return len(x[1]) - len(y[1])

def sorted_cluster_keys(clusters):
	sorted_pairs = sorted(clusters.iteritems(),cmp=compare_cluster_size,reverse=True)
	return [pair[0] for pair in sorted_pairs]

def most_similar(clusters):
	bestx = False
	besty = False
	best = 0
	for x in clusters.iterkeys():
		for y in clusters.iterkeys():
			if x != y:
				similarity = cluster_similarity(clusters[x],clusters[y])
				if similarity > best:
					bestx = x
					besty = y
					best = similarity
	return (bestx,besty,best)		
		
def remove_small_clusters(threshold,clusters):
	for key in clusters.copy().iterkeys():
		if len(clusters[key]) < threshold:
			del clusters[key]
	return clusters	

def main(args):
	similarity = float(args[1])  # don't merge clusters less similar than this 
	noun = args[2]
	infile = args[3]
	threshold = int(args[4])  # ignore words rarer than this
	
	interesting = set()
	
	clusters = create_initial_clusters(noun,infile)
	clusters = remove_small_clusters(threshold,clusters)

	print "clusters:",len(clusters)

	while True:
		(x,y,best) = most_similar(clusters)
		if best < similarity: break
		print "merging ",x,"and",y
		clusters[x + " "+ y] = clusters[x].union(clusters[y])
		interesting.add(x+" "+y)
		del clusters[x]
		del clusters[y]		
	
	biggest = sorted_cluster_keys(clusters)
	for key in biggest:
		if key in interesting:
			print key,":",len(clusters[key])
	
if __name__ == '__main__':
	main(sys.argv)
