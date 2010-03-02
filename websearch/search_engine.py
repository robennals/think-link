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
from urlparse import urlparse, parse_qs
from os import curdir, sep
from secret import bossKey
from urllib import quote_plus, urlopen
from xml.dom import minidom
import parallel_io as p

# TODO: cache url contents to avoid repeatedly downloading the same files

def do_search_result(result,pages):
	return template("search_result",title=child_text(result,"title"),
			abstract=child_text(result,"abstract"),
			url=child_text(result,"url"),
			dispurl=child_text(result,"dispurl"),
			date=child_text(result,"date"))

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
	("/static/javascript/\w*\.js","text/javascript"),
	("/static/stylesheets/\w*.css","text/css"),
	("/static/images/\w*.png","image/png")
	]
	
def template(name,**args):
	return Template(file("templates/"+name+".html").read()).substitute(args)

handlers = {"/search": do_search}

def node_text(node): return node.firstChild.data

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
				self.wfile.write(file(curdir + sep + req.path).read())
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
	server = HTTPServer(('',8080), SearchHandler)
	print "started web server"
	server.serve_forever()
	
if __name__ == '__main__':
	main()
