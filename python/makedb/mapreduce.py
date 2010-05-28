
from exceptions import NotImplementedError
from urllib import quote,unquote
import os
import json

"""
This is a really dumb mapreduce library that allows me to do simple
processing on large amounts of data. In the future this should 
be done over hadoop etc instead.

Right now we don't do any splits or anything else clever
"""

class InStore:
	"""a store that one can read from or map over"""
	def __init__(self,filename):
		self.infile = file(filename,"w")
		
	def __iter__():
		for line in self.infile:
			(key,key2,value) = line.strip().split("\t")
			yield (unquote(key),unquote(key2),json.loads(value))
			
	def shuffle(outfilename=None):
		if not outfilename: outfilename = self.filename + "_sorted"
		self.infile.close()
		os.system("sort <"+self.filename+" >"+outfilename)
		return ShuffledStore(outfilename)
		
	def map(mapper,outfilename):
		outstore = OutStore(outfilename)
		for (key,key2,value) in self:
			mapper(outstore,key,value)
		return outstore.toInStore()

	def map2(mapper,outfilename):
		outstore = OutStore(outfilename)
		for (key,key2,value) in self:
			mapper(outstore,key,key2,value)
		return outstore.toInStore()
				
				
class ShuffledStore(InStore):
	"""a store than one can apply a reduce operation to"""
	def __init__(self,filename):
		InStore.__init__(filename)
	
	def reduce(self,reducer,outfilename):
		outstore = OutStore(outfilename)
		for (key,key2,value) in self:
			reducer(outstore,key,value)
		return outstore.toInStore()
	
	def reduce2(self,reducer,outfilename):
		outstore = OutStore(outfilename)
		for (key,key2,value) in self:
			reducer(outstore,key,key2,value)
		return outstore.toInStore()
							

class OutStore:
	"""a key-value store than one can write to"""
	count = 0
	
	def __init__(self,filename):
		self.filename = filename
		self.outfile = file(filename,"w")
		
	def emit(self,key,value,key2 = ""):
		self.outfile.write(quote(key)+"\t"+quote(key2)+"\t"+json.dumps(value,ensure_ascii=False)+"\n")
		self.count += 1

	def toInStore(self):
		self.outfile.close()
		return InStore(self.filename)

class PrintOutStore:
	def emit(self,key,value,key2 = ""):
		print key,key2,value
		
			

class MapReduceJob:
	def loaddata(self): raiseNotImplementedError
	def map(self,context,key,value): raise NotImplementedError
	def map2(self,context,key,key2,value): return map(self,context,key,value)
	def reduce(self,context,key,value): raise NotImplementedError
	def reduce2(self,context,key,key2,value): raise reduce(self,context,key,value)

class Context:
	def __init__(self,outfile):
		self.outfile = outfile

	def emit(self,key,value,key2 = ""):
		self.outfile.write(quote(key)+'\t'+quote(key2)+'\t'+json.dumps(value)+'\n')

def fileinput(filename):
	i = 0
	for line in file(filename):
		yield (i,line.strip())
		i += 1

def mapinput(filename):
	for line in file(filename):
		(key,value) = line.strip().split('\t')
	
def mapreduce(job,tmpfilename="tempfile",sortedfilename="tempfile_sorted",outfilename="outfile"):
	tmpfile = file(tmpfilename,"w")
	mapcontext = Context(tmpfile)
	print "mapping"
	for (key,value) in job.loaddata():
		job.map(mapcontext,key,value)
	tmpfile.close()
	print "sorting"
	os.system("sort <"+tmpfilename+" > "+sortedfilename)
	print "reducing"
	sortedfile = file(sortedfilename)
	outfile = file(outfilename,"w")
	reducecontext = Context(outfile)
	for line in sortedfile:
		(key,key2,value) = line.strip().split('\t')
		job.reduce(reducecontext,unquote(key),json.loads(value))
	outfile.close()
	
	
	
	
	
		
		
