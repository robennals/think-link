#!/usr/bin/python
# add_claim.py
# Add all urls from a list for one claim
# jma 7 Jan 2010
""" For all the urls found for one claim,
add the claim and the urls.  Retrieve the
url contents in a subsequent pass.
"""
import os.path, pprint, re, string, sys, time
import claims_db_mod as db

dbg = False
get_this_many = 0
########################################################################

def main(args):

    # Create the db object
    the_db = db.db()
    
    # The claim is the file name, the file a list of urls
    cl_fn = args[0]
    cl_fd = open(cl_fn)
    cl_fn = re.sub(r'urls', '', cl_fn)
    # replace underscores with spaces.
    the_claim = re.sub(r'.url', '', re.sub('_', ' ', os.path.basename(cl_fn)))
    print 'claim: ', the_claim

    for a_url in cl_fd.readlines():
        # Enter the url into the db
        url_str = a_url[:-1]
        if dbg: print url_str
        the_db.add_url(url_str, the_claim)

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
    lofl = main(args)
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
