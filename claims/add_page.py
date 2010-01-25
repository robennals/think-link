#!/usr/bin/python
# _add_page.py
#   Use BeautifulSoup to find the txt in you tube transcripts.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   18 Jan 2010
#   $Id$

"""
Usage:
% ./_add_page.py -d 
"""
from __future__ import division
import pickle, os, sys
import nltk, re, pprint, string, time, types
import claims_db_mod as db
from BeautifulSoup import BeautifulSoup

dbg = False

########################################################################
def find_text(dom, tag_id='body'):

    ed = [dom.title.string]
    b_txt = ''
    para_ct = 0
    token_ct = 0
    
    t_body = dom.find(name=tag_id)
    body_generator = t_body.recursiveChildGenerator()
    if dbg:
        print t_body.renderContents()
        print '='*70
    # This is the right way to walk the html tags in order. 
    while True:
        try:
            item = body_generator.next()
            # Don't descend into the text part of the tag.
            if dbg: print ')) ', item.__class__.__name__ 
            if item.__class__.__name__ not in ('NavigableString', 'Comment', 'Declaration'):
                #print item.name
                if item.name not in ('script', 'button', 'input'):
                    if dbg:
                        print item
                    b_txt += '\n' + item.prettify()
        except StopIteration:
            break
        
##    for a_tag in t_body.next():#  t_body.findAll(text=True):
##        the_html = None
##        if not_tag.__class__.__name__ == 'NavigableString':
##            the_html = a_tag.renderContents()
##            if dbg: print the_html.strip()
##            if the_html:
##                ed.append(the_html)
    return(b_txt)
            
########################################################################
def main(fn):

    the_db = db.db()

    ## retrieve a url from the db, retrieve the page, and put it in the db
    ## find one empty page record with a url
    f_sql = 'SELECT page_id FROM page WHERE is_valid = 0 LIMIT 1'
    one_page = the_db.cursor.execute(f_sql).fetchone()

    ## Go and fill it
    full_txt = the_db.retrieve_url(one_page[0])
    dom = BeautifulSoup(full_txt)
    txt = find_text(dom)
    return txt

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
    lofl = main(args[0])
    print lofl
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
