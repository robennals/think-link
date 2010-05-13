#!/usr/bin/env python
# encoding: utf-8

"""
Implement a simple search engine on top of Yahoo BOSS that checks for 
disputes on the pages that are returned. 
"""

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import re
import sys
from string import Template
from urlparse import urlparse
from cgi import parse_qs
from os import curdir, sep
from secret import bossKey
from urllib import quote_plus, urlopen
from xml.dom import minidom
import nlptools.html_to_text as h
import parallel_io as p
import rareword_match as r
import compute_rarewords as cr

# TODO: cache url contents to avoid repeatedly downloading the same files

def get_page_disputes(url,pages):
	try:
		htmlcontent = pages[url]
		text = h.html_to_text(htmlcontent)
		matches = r.get_sorted_claims(text)
		disputes = [dispute for dispute in matches if (dispute[0] > 0)][:4]
		unique = []
		used = set({})
		for dispute in disputes:
			if (not dispute[3] in used) and (not dispute[4] in used):
				used.add(dispute[3])
				used.add(dispute[4])
				unique.append(dispute)
		disputes = [template("disputed_box",dispute = d[1]) for d in unique]
		return " ".join(disputes)
	except:
		return ""
	

def do_search_result(result,pages):
	return template("search_result",title=child_text(result,"title"),
			abstract=child_text(result,"abstract"),
			url=child_text(result,"url"),
			dispurl=child_text(result,"dispurl"),
			date=child_text(result,"date"),
			disputes=get_page_disputes(child_text(result,"url"),pages))

def child_text(parent,tag):
	return node_text(parent.getElementsByTagName(tag)[0]).encode("utf8","xmlcharrefreplace")

def do_search(path,args):
	query = args['q']
	bossxml = get_boss(query)
	urls = [node_text(node) for node in bossxml.getElementsByTagName("url")]
	pages = p.retrieve_urls_dict(urls)
	results = "".join([do_search_result(result,pages) for result in bossxml.getElementsByTagName("result")])
	return template("html",title=query + " - Dispute Finder Search", 
		body = template("search", query=query, results = results)
	)
	
static_file_patterns = [
	("/static/javascript/[\w\-\.]*\.js","text/javascript"),
	("/static/stylesheets/\w*.css","text/css"),
	("/static/images/\w*.png","image/png"),
	("/static/pages/\w*.html","text/html")
	]
	
def template(name,**args):
	return Template(file("websearch/templates/"+name+".html").read()).substitute(args)

handlers = {"/search": do_search}

def node_text(node): 
	try:
		return node.firstChild.data
	except:
		return ""

def get_boss(query):
	bossSvr = "http://boss.yahooapis.com/ysearch/web/v1"
	url = bossSvr + "/" + quote_plus(query) + "?appid="+bossKey+"&format=xml"
	dom = minidom.parse(urlopen(url))
	return dom

def one_arg(multargs):
	oneargs = {}
	for key in multargs:
		oneargs[key] = multargs[key][0]
	return oneargs

class SearchHandler(BaseHTTPRequestHandler):
	def do_GET(self):
		req = urlparse(self.path)
		action = re.match("/\w+",req.path).group(0)
		print action
		
		for (pattern,mime) in static_file_patterns:
			if re.match(pattern,req.path):
				self.send_response(200)
				self.send_header("Content-type",mime)
				self.end_headers()
				self.wfile.write(file("websearch" + sep + req.path).read())
				return 		
		
		if action in handlers:
			print "handler for",action
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()
			params = parse_qs(req.query)
			self.wfile.write(handlers[action](req.path,one_arg(params)))
		else:
			self.send_response(404)
#			self.send_header('Content-type','text/html')
			self.end_headers();
			self.wfile.write("Not found: "+self.path)
		
def main():
	try:
		server = HTTPServer(('',8280), SearchHandler)
		print "started web server"
		server.serve_forever()
	except KeyboardInterrupt:
		print "shutting down server"
		server.socket.close()
	
if __name__ == '__main__':
	cr.compute_rarewords()
	cr.add_old_claims()
	main()
