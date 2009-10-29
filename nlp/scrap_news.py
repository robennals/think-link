#!/usr/bin/python
# scrape_news.py
#   This python module uses BOSS to grab a large amount of text from the web
#   under one claim.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   12 Oct 2009
#   $Id: scrap_news.py 60 2009-10-20 03:50:18Z jmagosta $

"""
Usage:
python scrape_news.py training_data.pkl [-f 10] [-R]
"""

from __future__ import division
import pickle, os, sys
import nltk, re, pprint, string, time
import tempfile
import urllib2
from bingapi import bossapi

# api = bossapi.Boss('<appid>')
# api.do_web_search('Uswaretech')
# api.do_news_search('salsa')
# api.do_siteexplorer_search('http://uswaretech.com')

########################################################################
dbg = 0
news_dir = 'news/'
n_depth = 1
claim_title = ''
boss_appid = 'NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E'

tst_keywords=['health policy', 'medical insurance', 'bankrupcies', 'medical bills',
'debt', 'god must exist', 'cap and trade', 'patent policy']



########################################################################
    
#
def parse_search(finds):
    search_response = finds['ysearchresponse']
    result_set = search_response['resultset_web']
    urls = [ r_set['url'] for r_set in result_set]
    return(urls)

########################################################################
class content(object):
    
    def __init__(self, the_claim, urls_found):
#        self.content = ''
        self.web_content = []
        self.claim = the_claim
        self.urls = urls_found
        self.toks = []
        
 
    # Find the editorial text on a web page
    def retrieve_editorial(self, a_url):

        editorial =[]
        # Open URL object
        print a_url, " < url"

        try:
            page = urllib2.urlopen(a_url)

            contents = page.read()
            print "contents, bytes ", len(contents)

            for para in re.finditer(r'<p>(.*?)</p>', contents, re.DOTALL):
                try:
                    para = para.groups()[0]
                    print "para ", len(para)
                    cleaned = nltk.clean_html(para)
                    self.toks  = nltk.word_tokenize(cleaned)
                    self.toks = [it.lower() for it in self.toks]
                    self.remove_punctuation()
                    editorial.extend(self.toks)
                except Exception, e:
                    print para
                    print e

                if dbg: print(editorial)
        except:
            print >> sys.stderr, a_url, " web retrieval failed"

        for a_word in self.claim.split():
            print a_word, editorial.count(a_word), ' times'

        return(editorial)

    def add_to_content(self):
        self.web_content = [self.retrieve_editorial(a_url) for a_url in self.urls]
           

    def add_to_prefix_tree(self):
        # global web_content
        pass
    
    def harvest_prefix_tree(self):
        print sum([len(x) for x in self.web_content]), ' tokens'
        df=tempfile.NamedTemporaryFile(prefix=str(self.claim)
                                       , suffix='.txt'
                                       , dir=os.path.join(os.getcwd(), news_dir)
                                       , delete=False)
        print 'writing ', df.name
        df.write(repr(self.web_content))
        df.close()

    def remove_punctuation(self):
        "Remove tokens that are runs of punctuation chars"
        self.toks = [x for x in self.toks if not(frozenset(x) < frozenset(string.punctuation))]
        # return cleaned


########################################################################
def main(k):

    # Expand claim to related keywords
    keyword_set = [tst_keywords[int(k)]]

    # retrieve  search engine keyword search results
    urls_found = []
    searcher = bossapi.Boss(boss_appid)
    for keywords in keyword_set:
        keywords = re.sub('\s+','%20',keywords)
        print keywords
        search_result = searcher.do_web_search(keywords)

        # retrieve urls from search results
        if search_result:
            urls_found.extend(parse_search(search_result))
        else:
            print >> sys.stderr, 'No search result for ', keywords

    if dbg: print urls_found

    it = content(keyword_set[0], urls_found)

    # retrieve text from url's pages
    it.add_to_content()

    # build meme-tree from text
    it.add_to_prefix_tree()
    
    # find rare n-grams, candidate memes. 
    it.harvest_prefix_tree()

########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1

    if '-c' in sys.argv:
        n_arg = sys.argv.index('-c')
        folds = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    time.clock()
    args = sys.argv[1:]
    lofl = main(args[0])
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
