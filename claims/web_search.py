#!/usr/bin/python
#  web_search.py
#   This python module uses BOSS & Curl to grab a large amount of text from the web
#   under one query.  Then extract_body pulls out the interesting parts, the
#   title and body html, sans scripts and comments, to reduce by 
#   about half the bytes to store. 
#
#   Part of project:	Confront
#
#   Author and date:	JMA   22 Feb 2010
#   $Id: scrap_news.py 74 2009-11-21 03:18:55Z jmagosta $

"""
Import these functions:

search_urls(keyword_str, this_many)
url_read(the_url)
extract_body(full_txt)

Run with a search string as an argument to test the functions:
% ./web_search.py 'global warming is a hoax'

"""

import re, sys
from BeautifulSoup import BeautifulSoup

## obscure trick to make unicode() work. 
reload(sys)
sys.setdefaultencoding('utf-8')

from bingapi import bossapi

### BOSS example
# api = bossapi.Boss('<appid>')
# api.do_web_search('Uswaretech')
# api.do_news_search('salsa')
# api.do_siteexplorer_search('http://uswaretech.com')

dbg        = True
boss_appid = 'NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E'


########################################################################
def search_urls(keyword_str, this_many):
	"Return a list of urls from a search string."

    # how much to get at one time  (BOSS sets a limit of 50). 
    batch_retrieval_ct = 40

    reps = this_many // batch_retrieval_ct
    rem = [this_many % batch_retrieval_ct]
    reps = (reps *[batch_retrieval_ct])
    if rem[0] != 0:
        reps.extend(rem)


    # retrieve  search engine keyword search results
    urls_found = []
    
    searcher = bossapi.Boss(boss_appid)
    #for keywords in keyword_set:
    keyword_arg = re.sub('\s+','%20',keyword_str)
    print "search terms: ",keywords

    first_item = 0
    for batch in reps:
        search_result = searcher.do_web_search(keyword_arg, count=batch, start = first_item)
        first_item += batch

        # retrieve urls from search results
        if search_result:
            urls_found.extend(parse_search(search_result))
        else:
            print >> sys.stderr, 'No search result for ', keywords

    if dbg: print first_item, urls_found
    return urls_found


#------------------------------------------------------------------
def parse_search(finds):
    search_response = finds['ysearchresponse']
    result_set = search_response['resultset_web']
    urls = [ r_set['url'] for r_set in result_set]
    return(urls)

    
#------------------------------------------------------------------
def url_read(the_url):
    """Retrieve the full html from a site. Replace the python module retrieval functions 
	with the curl cmd line utility. It works on more sites."""
    #import urllib
    #page = urllib.urlopen(the_url)

    import subprocess
    contents = subprocess.Popen(["curl", the_url], stdout=subprocess.PIPE).communicate()[0]
    contents = unicode(contents, 'utf-8', 'ignore')
    print "retrieved ", len(contents), 'bytes; ', 
    return(contents)


#------------------------------------------------------------------
def remove_punctuation(toks):
    "Remove tokens that are runs of punctuation chars"
    toks = [x for x in toks if not(frozenset(x) < frozenset(string.punctuation))]
    return toks


#------------------------------------------------------------------
def extract_body(full_txt):
    "Extract the html title and body strings, and remove both script and comment html."
    rem_script = re.compile('<script.*?</script>',  re.DOTALL)
    rem_cmt = re.compile('<!--.*?-->',  re.DOTALL)
    dom = BeautifulSoup(full_txt)
    title_str = ''
    if dom.title:
        title_str = dom.title.string
    html_body = dom.body
    if dbg: print len(str(html_body)), ' ---- ',
    html_body = rem_script.sub(' ', str(html_body))
    html_body = rem_cmt.sub(' ', str(html_body))
    if dbg: print len(html_body), '\n'
    return (title_str, html_body)
    

########################################################################
if __name__ == '__main__':

    # test by returning the body of a url
    url_list = search_urls(sys.argv[1], 1)[0]
    print url_list

    # Don't try to parse a pdf file 
    if not re.search('pdf$', url_list):

        contents = url_read(url_list)
        extraction = extract_body(contents)
        print extraction[0], '\n'

        # See - the dom html extraction works even on fragments of the original dom! 
        print BeautifulSoup(extraction[1]).h1, '\n'

    
### (c) 2009 Intel Corporation

    
