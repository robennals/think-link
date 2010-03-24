from numpy import *
from PIL import Image,ImageDraw

"""
Code for hierarchical clustering

Credits:
Modified from "Programming Collective Intelligence" by Toby Segaran
See also http://jesolem.blogspot.com/2009/04/hierarchical-clustering-in-python.html

"""

class cluster_node:
	def __init__(self,vec,left=None,right=None,distance=0.0,id=None,count=1):
		self.left=left
		self.right=right
		self.vec=vec
		self.id=id
		self.distance=distance
		self.count=count #only used for weighted average 

def L2dist(v1,v2):
	return sqrt(sum((v1-v2)**2))
	
def L1dist(v1,v2):
	return sum(abs(v1-v2))

# def Chi2dist(v1,v2):
#	  return sqrt(sum((v1-v2)**2))

def cosine_distance(a, b):
	# Returns cosine distance. Not in original hclusterx
	numerator = 0
	denoma = 0
	denomb = 0
	for i in range(len(a)):
		numerator += a[i]*b[i]
		denoma += abs(a[i])**2
		denomb += abs(b[i])**2
	return 1 - numerator / (sqrt(denoma)*sqrt(denomb))

def pearson(v1,v2): 
	# print v1
	# print v2
	# Simple sums 
	sum1=sum(v1) 
	sum2=sum(v2) 
	# Sums of the squares 
	sum1Sq=sum([pow(v,2) for v in v1]) 
	sum2Sq=sum([pow(v,2) for v in v2]) 
	# Sum of the products 
	pSum=sum([v1[i]*v2[i] for i in range(len(v1))]) 
	# Calculate r (Pearson score) 
	num=pSum-(sum1*sum2/len(v1)) 
	den=sqrt((sum1Sq-pow(sum1,2)/len(v1))*(sum2Sq-pow(sum2,2)/len(v1))) 
	if den==0: return 0 
	return 1.0-num/den 



def hcluster(features,distance=L2dist):
	#cluster the rows of the "features" matrix
	distances={}
	currentclustid=-1

	# clusters are initially just the individual rows
	clust=[cluster_node(array(features[i]),id=i) for i in range(len(features))]

	while len(clust)>1:
		lowestpair=(0,1)
		closest=distance(clust[0].vec,clust[1].vec)
	
		# loop through every pair looking for the smallest distance
		for i in range(len(clust)):
			for j in range(i+1,len(clust)):
				# distances is the cache of distance calculations
				if (clust[i].id,clust[j].id) not in distances: 
					distances[(clust[i].id,clust[j].id)]=distance(clust[i].vec,clust[j].vec)
		
				d=distances[(clust[i].id,clust[j].id)]
		
				if d<closest:
					closest=d
					lowestpair=(i,j)
		
		# calculate the average of the two clusters
		mergevec=[(clust[lowestpair[0]].vec[i]+clust[lowestpair[1]].vec[i])/2.0 \
			for i in range(len(clust[0].vec))]
		
		# create the new cluster
		newcluster=cluster_node(array(mergevec),left=clust[lowestpair[0]],
							 right=clust[lowestpair[1]],
							 distance=closest,id=currentclustid)
		
		# cluster ids that weren't in the original set are negative
		currentclustid-=1
		del clust[lowestpair[1]]
		del clust[lowestpair[0]]
		clust.append(newcluster)

	return clust[0]

def readfile(filename): 
	lines=[line for line in file(filename)] 
	# First line is the column titles 
	colnames=lines[0].strip().split('\t')[1:] 
	rownames=[] 
	data=[] 
	for line in lines[1:]: 
		p=line.strip().split('\t') 
		# First column in each row is the rowname 
		rownames.append(p[0]) 
		# The data for this row is the remainder of the row 
		data.append([float(x) for x in p[1:]]) 
	return rownames,colnames,data 



def hcluster2(rows,distance=pearson): 
	distances={} 
	currentclustid=-1 
	# Clusters are initially just the rows 
	clust=[cluster_node(rows[i],id=i) for i in range(len(rows))] 
	while len(clust)>1: 
		lowestpair=(0,1) 
		closest=distance(clust[0].vec,clust[1].vec) 
		# loop through every pair looking for the smallest distance 
		for i in range(len(clust)): 
			for j in range(i+1,len(clust)): 
				# print 'i',i
				# print 'j',j
				# distances is the cache of distance calculations 
				if (clust[i].id,clust[j].id) not in distances: 
					distances[(clust[i].id,clust[j].id)]=distance(clust[i].vec,clust[j].vec) 
				d=distances[(clust[i].id,clust[j].id)] 
				if d<closest: 
					closest=d 
					lowestpair=(i,j) 
		# calculate the average of the two clusters 
		mergevec=[ 
		(clust[lowestpair[0]].vec[i]+clust[lowestpair[1]].vec[i])/2.0 
		for i in range(len(clust[0].vec))] 
		# create the new cluster 
		newcluster=cluster_node(mergevec,left=clust[lowestpair[0]], 
												 right=clust[lowestpair[1]], 
												 distance=closest,id=currentclustid) 
		# cluster ids that weren't in the original set are negative 
		currentclustid-=1 
		del clust[lowestpair[1]] 
		del clust[lowestpair[0]] 
		clust.append(newcluster) 
	return clust[0]

def extract_clusters(clust,dist):
	# extract list of sub-tree clusters from hcluster tree with distance<dist
	clusters = {}
	if clust.distance<dist:
		# we have found a cluster subtree
		return [clust] 
	else:
		# check the right and left branches
		cl = []
		cr = []
		if clust.left!=None: 
			cl = extract_clusters(clust.left,dist=dist)
		if clust.right!=None: 
			cr = extract_clusters(clust.right,dist=dist)
		return cl+cr 
		
def get_cluster_elements(clust):
	# return ids for elements in a cluster sub-tree
	if clust.id>0:
		# positive id means that this is a leaf
		return [clust.id]
	else:
		# check the right and left branches
		cl = []
		cr = []
		if clust.left!=None: 
			cl = get_cluster_elements(clust.left)
		if clust.right!=None: 
			cr = get_cluster_elements(clust.right)
		return cl+cr


def printclust(clust,labels=None,n=0):
	# indent to make a hierarchy layout
	for i in range(n): print ' ',
	if clust.id<0:
		# negative id means that this is branch
		print '-'
	else:
		# positive id means that this is an endpoint
		if labels==None: print clust.id
		else: print labels[clust.id]
	
	# now print the right and left branches
	if clust.left!=None: printclust(clust.left,labels=labels,n=n+1)
	if clust.right!=None: printclust(clust.right,labels=labels,n=n+1)



def getheight(clust):
	# Is this an endpoint? Then the height is just 1
	if clust.left==None and clust.right==None: return 1
	
	# Otherwise the height is the same of the heights of
	# each branch
	return getheight(clust.left)+getheight(clust.right)

def getdepth(clust):
	# The distance of an endpoint is 0.0
	if clust.left==None and clust.right==None: return 0
	
	# The distance of a branch is the greater of its two sides
	# plus its own distance
	return max(getdepth(clust.left),getdepth(clust.right))+clust.distance
	  
	  
def drawdendrogram(clust,labels,jpeg='dendrogram.jpg'):
	# height and width
	# print 'height: ' + str(getheight(clust))
	h=getheight(clust)*20
	# print h
	w=1200
	depth=getdepth(clust)
	# print 'depth: ' + str(depth)
	# width is fixed, so scale distances accordingly
	scaling=float(w-630)/depth
	print 'scaling: ' + str(scaling)
	# Create a new image with a white background
	img=Image.new('RGB',(w,h),(255,255,255))
	draw=ImageDraw.Draw(img)
	
	draw.line((0,h/2,10,h/2),fill=(255,0,0))	
	
	# Draw the first node
	drawnode(draw,clust,10,(h/2),scaling,labels)
	img.save(jpeg)

def drawnode(draw,clust,x,y,scaling,labels):
	if clust.id<0:
		h1=getheight(clust.left)*20
		h2=getheight(clust.right)*20
		top=y-(h1+h2)/2
		bottom=y+(h1+h2)/2
		# Line length
		ll=clust.distance*scaling
		# Vertical line from this cluster to children	 
		draw.line((x,top+h1/2,x,bottom-h2/2),fill=(255,0,0))	
		
		# Horizontal line to left item
		draw.line((x,top+h1/2,x+ll,top+h1/2),fill=(255,0,0))	
		
		# Horizontal line to right item
		draw.line((x,bottom-h2/2,x+ll,bottom-h2/2),fill=(255,0,0))		  
		
		# Call the function to draw the left and right nodes	
		drawnode(draw,clust.left,x+ll,top+h1/2,scaling,labels)
		drawnode(draw,clust.right,x+ll,bottom-h2/2,scaling,labels)
	else:	
		# # If this is an endpoint, draw a thumbnail image
		# # nodeim = Image.open(imlist[clust.id])  #original line
		# nodeim = Image.open('green.jpg')
		# nodeim.thumbnail((20,20))
		# ns = nodeim.size
		# img.paste(nodeim,(x,y-ns[1]//2,x+ns[0],y+ns[1]-ns[1]//2))
		# # If this is an endpoint, draw the item label 
		draw.text((x+5,y-7),labels[clust.id],(0,0,0))
	
def scaledown(data,distance=pearson,rate=0.01): 
	n=len(data)

	# The real distances between every pair of items 
	realdist=[[distance(data[i],data[j]) for j in range(n)] 
			   for i in range(0,n)]

	outersum=0.0 

	# Randomly initialize the starting points of the locations in 2D 
	loc=[[random.random(),random.random()] for i in range(n)]
	fakedist=[[0.0 for j in range(n)] for i in range(n)]

	lasterror=None
	for m in range(0,1000):
		# Find projected distances 
		for i in range(n): 
			for j in range(n): 
				fakedist[i][j]=sqrt(sum([pow(loc[i][x]-loc[j][x],2) 
									     for x in range(len(loc[i]))])) 

		# Move points
		grad=[[0.0,0.0] for i in range(n)]

		totalerror=0 
		for k in range(n): 
			for j in range(n): 
				if j==k: continue
				# The error is percent difference between the distances 
				errorterm=(fakedist[j][k]-realdist[j][k])/realdist[j][k]

				# Each point needs to be moved away from or towards the other 
				# point in proportion to how much error it has 
				grad[k][0]+=((loc[k][0]-loc[j][0])/fakedist[j][k])*errorterm 
				grad[k][1]+=((loc[k][1]-loc[j][1])/fakedist[j][k])*errorterm

				# Keep track of the total error 
				totalerror+=abs(errorterm) 
		print totalerror

		# If the answer got worse by moving the points, we are done 
		if lasterror and lasterror<totalerror: break 
		lasterror=totalerror

		# Move each of the points by the learning rate times the gradient 
		for k in range(n): 
			loc[k][0]-=rate*grad[k][0] 
			loc[k][1]-=rate*grad[k][1]

	return loc 


def draw2d(data,labels,jpeg='mds2d.jpg'): 
	img=Image.new('RGB',(2000,2000),(255,255,255)) 
	draw=ImageDraw.Draw(img) 
	for i in range(len(data)): 
		x=(data[i][0]+0.5)*1000 
		y=(data[i][1]+0.5)*1000 
		draw.text((x,y),labels[i],(0,0,0)) 
	img.save(jpeg,'JPEG')