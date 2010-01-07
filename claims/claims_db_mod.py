#!/usr/bin/python
# a wrapper around the claims db, to modify its contents
# jma 3 Feb 2010 Confrontational Computing

"""
Usage:
python peruse.py  [-d] [-c 10] 'Claim text'

-c  number of urls to retrieve
-d  debug
"""

from __future__ import division
import glob
import pickle, os, sys
import nltk, re, pprint, string, time
import pyodbc
import tempfile
from BeautifulSoup import BeautifulSoup
import textwrap

## obscure trick to make unicode() work. 
reload(sys)
sys.setdefaultencoding('utf-8')

#-----------------------------------------------------------------------

db_files = '../db'

kPrepP   = 1  # prepositional phrase
kDispute = 2  # disputed claim


cn_str = 'DRIVER={myodbc_driver};DATABASE=phrase;UID=url;PWD=0url;SOCKET=/var/run/mysqld/mysqld.sock'
url_dir = 'urlphrases/'
all_urls = {}

def add_to_hash(the_urls, the_file):

    ml = 0
    fd = open(the_file)
    for a_line in fd.readlines():
        ml = max(ml, len(a_line))

        root_url = re.findall('^http[s]?://([^/]+)', a_line)
       # print root_url

        if root_url:
            the_urls[root_url[0]] =  re.sub('\.url', '', re.sub('urlphrases/', '', the_file))
            
    print "max(len(url)", ml
    fd.close()
    return(the_urls)


########################################################################
class db:

    def __init__(self):
        try:
            cn = pyodbc.connect(cn_str)
            self.cursor = cn.cursor
        except Exception, e:
            print e

    ## check first if the claim already exists
    def add_claim(self, the_claim, claim_type = kDispute):
        claim_hash = hash(the_claim)
        self.cursor.execute(r'INSERT INTO claim VALUES ('\
                            + the_claim + ', '\
                            + str(claim_type) + ', '\
                            + str(claim_hash) + ', '\
                            + 'NULL );')              # page key
        return( claim.hash )

    def add_url(self, the_url, the_claim_hash):
        # Split out the site and path
        m_obj = re.match(r'(http[s]?://[^/]+/)(.*)', the_url)
        if m_obj:
            url_pieces = m_obj.groups()
            (site, path) = url_pieces
            site_hash = hash(site)
            path_hash = hash(path)
            # First create the empty page entry
            p_sql = r'INSERT INTO page VALUES ("'\
                  + path + '", '\
                  + '0, NULL, NULL, NULL, 10000000, NULL, '\
                  + str(path_hash) + ', '\
                  + str(the_claim_hash) + ', '\
                  + str(site_hash) + ');'
            if dbg: print p_sql
            self.cursor.execute(p_sql)
            s_sql = r'INSERT INTO site VALUES("'\
                    + site + '", 0,'\
                    + str(site_hash) + ','\
                    + str(path_hash) + ');'
            if dbg: print s_sql
            self.cursor.execute(s_sql)
            c_sql = r'UPDATE claim SET page_id = '\
                  + str(path_hash) + ' WHERE claim_id = '\
                  + str(the_claim_hash) + ';'
            self.cursor.execute(c_sql)
            if dbg: print c_sql                    
            
        else:
            print >> sys.stderr, 'Could not parse url: ', the_url

    def retrieve_url(self, the_page_hash, renew=False):
        pass

    def find_claim(self, the_claim):
        f_sql = 'SELECT * FROM claim WHERE claim = ' + the_claim + ';'
        claim_set = self.cursor.execute(f_sql).fetchall()
        if len(claim_set) != 1:
            print >> sys.stderr, len(claim_set), ' found for claim ', the_claim
        return(claim_set)

    
    def all_sites_for(self, the_claim):
        pass

    def all_claims_for(self, the_site):
        pass
            
        

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
        get_this_many = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    time.clock()
    args = sys.argv[1:]
    lofl = main(args[0], get_this_many)
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
