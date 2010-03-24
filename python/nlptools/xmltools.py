"""
Simple tools to make parsing XML easier.
"""

from xml.dom import minidom
from urllib2 import urlopen

class XML:
	dom = None
	def __init__(self,infile=None,dom=None):
		if infile:
			self.dom = minidom.parse(infile)
		elif dom:
			self.dom = dom
	
	def text(self):
		sofar = ""
		for child in self.dom.childNodes:
			if child.nodeType == self.dom.TEXT_NODE or child.nodeType == self.dom.CDATA_SECTION_NODE:
				sofar = sofar + " " + child.data
		return sofar
	
	def attr(self,name):
		return self.dom.getAttribute(name)
	
	def toDict(self):
		out = {}
		for child in self.dom.childNodes:
			if child.nodeType == self.dom.ELEMENT_NODE:
				out[child.tagName] = text(child)
		return out

	def __getitem__(self,tag):
		return self.find(tag).text()
		
	def toDictList(self,tag):
		return [child.toDict() for child in self.findAll(tag)]
		
	def findAll(self,tag):
		return [XML(dom=x) for x in self.dom.getElementsByTagName(tag)]

	def find(self,tag):
		return XML(dom=self.dom.getElementsByTagName(tag)[0])	

	def childtext(self,tag):
		return text(self.dom.getElementsByTagName(tag)[0]).encode("utf8","xmlcharrefreplace")
		
