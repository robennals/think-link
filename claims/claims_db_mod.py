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

import scrape_news as sc # url_read() parse_search() 

## obscure trick to make unicode() work. 
reload(sys)
sys.setdefaultencoding('utf-8')

#-----------------------------------------------------------------------

dbg = False
db_files = '../../db'

kPrepP   = 1  # prepositional phrase
kDispute = 2  # disputed claim


cn_str = 'DRIVER={myodbc_driver};DATABASE=phrase;UID=url;PWD=0url;SOCKET=/var/run/mysqld/mysqld.sock'
url_dir = 'urlphrases/'
all_urls = {}

# Create a hash of site urls hashed with their claims, just to inspect them
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
            self.cursor = cn.cursor()
        except Exception, e:
            print 'Connection error:', e
        if dbg: print self.cursor.execute('SHOW DATABASES;').fetchall()


    def add_claim(self, the_claim, claim_type = kDispute):
        claim_hash = hash(the_claim)
        sql_tst = 'SELECT claim_id FROM claim WHERE claim_id =?'
        if dbg: print sql_tst
        if self.cursor.execute(sql_tst, str(claim_hash)).fetchone():
            if dbg: print >> sys.stderr, the_claim, ' is already in the DB.'
        else:
            sql_c = r"INSERT INTO claim VALUES ('"\
                    + the_claim + "', "\
                    + str(claim_type) + ', '\
                    + str(claim_hash) + ');'
            if dbg: print sql_c
            self.cursor.execute(sql_c)              
        return( claim_hash )

    def add_site(self, the_site):
        site_hash = hash(the_site)
        sql_tst = 'SELECT site_id FROM site WHERE site_id =?'
        if self.cursor.execute(sql_tst, str(site_hash)).fetchone():
            if dbg: print >> sys.stderr, 'site ', the_site, ' is already in the db.'
        else:
            sql_s = r"INSERT INTO site VALUES ('"\
                    + the_site + "', 1, "\
                     + str(site_hash) + ');'
            if dbg: print sql_s
            self.cursor.execute(sql_s)              
        return( site_hash )


    def add_url(self, the_url, the_claim):
        # Split out the site and path
        m_obj = re.match(r'(http[s]?://[^/]+/)(.*)', the_url)
        if m_obj:
            url_pieces = m_obj.groups()
            (site, path) = url_pieces
            claim_hash = self.add_claim(the_claim)
            site_hash = self.add_site(site)
            path_hash = hash(path)
            sql_tst = 'SELECT page_id FROM page WHERE page_id =?'
            if self.cursor.execute(sql_tst, str(path_hash)).fetchone():
                print >> sys.stderr, 'page ', path_hash, ' is already in the db.'
            else:
                # First create the empty page entry
                p_sql = r'INSERT INTO page VALUES (?, 0, NULL, NULL, NULL, 10000000, NULL, ?, ?, ?)'

                if dbg: print p_sql
                self.cursor.execute(p_sql, path, path_hash, claim_hash, site_hash)
        else:
            print >> sys.stderr, 'Could not parse url: ', the_url


    def retrieve_url(self, the_page_hash, renew=False):

        # Reconstruct the url for that page
        r_sql = r'''SELECT CONCAT(s.url_root, p.path_str)
        FROM site as s INNER JOIN page as p USING(page_id)
        WHERE page_id=''' + str(the_page_hash) + ';'

        # find the url for that page
        a_url = self.cursor.execute(r_sql).fetchone()
        if dbg: print 'url: ', a_url
        full_page_contents = sc.url_read(a_url[0])
        # save it to a file in the db filesystem
        return(sc.body_title_text(full_page_contents))
    

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
