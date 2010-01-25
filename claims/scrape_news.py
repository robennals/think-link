#!/usr/bin/python
# scrape_news.py
#   This python module uses BOSS to grab a large amount of text from the web
#   under one claim.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   12 Oct 2009
#   $Id: scrap_news.py 74 2009-11-21 03:18:55Z jmagosta $

"""
Scrape the urls found for the claim and write out a list of lists of tokens
of the url's page contents. 

Usage:
python scrape_news.py  [-d] [-c 10] 'Claim text'

-c  number of urls to retrieve
-d  debug
"""

from __future__ import division
import pickle, os, sys
import nltk, re, pprint, string, time
import tempfile

## obscure trick to make unicode() work. 
reload(sys)
sys.setdefaultencoding('utf-8')

from bingapi import bossapi

### BOSS example
# api = bossapi.Boss('<appid>')
# api.do_web_search('Uswaretech')
# api.do_news_search('salsa')
# api.do_siteexplorer_search('http://uswaretech.com')

########################################################################
dbg = False
news_dir = 'news/' # Save to this dir
claim_title = ''
get_this_many = 1

boss_appid = 'NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E'



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

            contents = self.url_read(a_url)

            para_ct = 0
            for para in re.finditer(r'<p>(.*?)</p>', contents, re.DOTALL):
                try:
                    para = para.groups()[0]
                    if dbg: print "para ", len(para)
                    para_ct += len(para)
                    cleaned = nltk.clean_html(para)
                    self.toks = cleaned.split()
                    # self.toks  = nltk.word_tokenize(cleaned)
                    self.toks = [it.lower() for it in self.toks]
                    self.remove_punctuation()
                    if dbg: print(self.toks)
                    editorial.extend(self.toks)
                except Exception, e:
                    print para
                    print e



            print para_ct, 'symbols'
        except Exception, e:
            print a_url, " web retrieval failed", e

        for a_word in self.claim.split():
            print a_word, ': ', editorial.count(a_word), ', ',
        print len(editorial), 'Tokens'

        return(editorial)

   ## _________________________________________________________________________
    def url_read(self, the_url):
        "Replace the module retrieval functions with one that works"
        #import urllib
        #page = urllib.urlopen(the_url)

        import subprocess
        contents = subprocess.Popen(["curl", the_url], stdout=subprocess.PIPE).communicate()[0]
        contents = unicode(contents)
        print "retrieved ", len(contents), 'bytes; ', 
        return(contents)

    
    def remove_punctuation(self):
        "Remove tokens that are runs of punctuation chars"
        self.toks = [x for x in self.toks if not(frozenset(x) < frozenset(string.punctuation))]

    ## _________________________________________________________________________
    def add_to_content(self):
        self.web_content = [self.retrieve_editorial(a_url) for a_url in self.urls]
    
    def save_content(self):
        print sum([len(x) for x in self.web_content]), 'Total tokens'

        ## Use the first name as base for the memes file
      
        cl_prefix = re.sub('\s+','', self.claim)[0:10]

        df=tempfile.NamedTemporaryFile(prefix = cl_prefix
                                       , suffix='.txt'
                                       , dir=os.path.join(os.getcwd(), news_dir)
                                       , delete=False)
        print 'writing ', df.name
        df.write(repr(self.web_content))
        df.close()
        return df.name


########################################################################
def search_urls(keywords, this_many):

    # how much to get at one time
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
    keyword_arg = re.sub('\s+','%20',keywords)
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



########################################################################
def main(args, get_this_many):

    # Working dir for contents
    if not os.path.exists(news_dir):
        os.makedirs(news_dir)

    # a string of tokens making up the claim
    keywords = args

    # run BOSS on claim text to get urls
    urls_found = search_urls(keywords, int(get_this_many))
    it = content(keywords, urls_found)

    # retrieve text from url's pages
    it.add_to_content()
    
    # print a list of lists of tokens
    content_file = it.save_content()
    return content_file

########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = True

    if '-c' in sys.argv:
        n_arg = sys.argv.index('-c')
        get_this_many = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    time.clock()
    args = sys.argv[1:]
    lofl = main(args[0], get_this_many)
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
