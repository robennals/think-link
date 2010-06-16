#!/usr/bin/env python
# encoding: utf-8

"""
Translate an HTML file into simple text, discarding anything that 
might mess up claim detection.
"""

import re

script = re.compile("(<script.*?>.*?</script>)",re.I)
style = re.compile("(<style.*?>.*?</style>)",re.I)
comment = re.compile("<!--.*?-->")
head = re.compile("<head.*?>.*?</head>",re.I)
inline = re.compile("</?(b|em|u|font|strong|a|i|img|mark|span|cite|abbr|blockquote|time|sup|sub|q).*?>",re.I)
para = re.compile("</?(p|br).*?>",re.I)
tag = re.compile("</?.*?>")
inittag = re.compile("^.*?>")
seps = re.compile("[\.\s]*\.\s[\.\s]*")
space = re.compile("\s+")
simplespace = re.compile(" +")
simpleseps = re.compile("[\. ]*\.[\. ]*")
specials = re.compile("\&#?[\w\d]+\;")

def html_to_text(html):
	html = html.replace("\n"," ")
	html = script.sub(". ",html)
	html = style.sub(". ",html)
	html = comment.sub(". ",html)
	html = head.sub(". ",html)
	html = inline.sub(" ",html)
	html = tag.sub(". ",html)
	html = inittag.sub("",html)
	html = seps.sub(". ",html)
	html = space.sub(" ",html)
	html = specials.sub(" ",html)
	return html


def html_to_segments(html):
	html = html.replace("\n"," ").replace("\t"," ")
	html = script.sub(". ",html)
	html = style.sub(". ",html)
	html = comment.sub(". ",html)
	html = head.sub(". ",html)
	html = inline.sub(" ",html)
	html = para.sub(". ",html)
	html = space.sub(" ",html)
	html = tag.sub("\t",html)
	html = inittag.sub("",html)
	html = simpleseps.sub(". ",html)
	html = specials.sub(" ",html)
	return html

def starts_in_tag(html):
	if ">" in html:
		if "<" in html and html.find("<") < html.find(">"):
			return False
		else: 
			return True
	else:
		return False
