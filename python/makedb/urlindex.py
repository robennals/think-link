import mapreduce

"""
create an index of URLs.
"""

class CreateIndex(mapreduce.MapReduceJob):
	def __init__(self,urlsfilename):
		self.urlsfilename = urlsfilename
	
	def loaddata(self,context): return fileinput(context,self.urlsfilename)

	def map(self,context,key,line):
		(date,url,query) = line.split("\t")
		context.emit(url,(date,query))
	
	lasturl = None
	lastid = 0
	def reduce(self,context,url,(date,query)):
		if url != self.lasturl:
			context.emit(url,(self.lastid+1,date,query))
			self.lasturl = url
			self.lastid = self.lastid+1


		
class MergeIndex(mapreduce.MapReduceJob):
	""" 
	Given some id indexed data, and other data of the same format,
	all indexed by unique keys, create new id-indexed entries for 
	every entry that doesn't have an id.
	"""
	 
	def __init__(self,iddata,otherdata,maxid):
		self.iddate = iddata
		self.inputs = inputs
		self.nextid = maxid
	
	def loaddata(self,context):
		for line in iddata:			
			context.emit(line
		for data in otherdata:
			for line in data:
				yield line
	
	def map(self,context,item)	
			
