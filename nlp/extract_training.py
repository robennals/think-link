#!/usr/bin/python
#   Part of project:	Confront
#
#   Author and date:	JMA   27 Aug 2009
#
"""Pkl disputeFinder json claims into training data form:
snippets:
   claim_id:       int
   text:           string
   instance_count: int

   yes_id:           int[]
   yes_abstract:     string[]
   no_id:            int[]
   no_abstract:      string[]

   
Usage:
python extract_training.py [-d] [-f file.json] [-w claim_id]
"""
svn_id =   '$Id: extract_training.py 50 2009-10-13 16:35:08Z jmagosta $'

import os, pickle, pprint, re, sys, time
import json

dbg = 0
test_claim = None #6536 # The world is running out of oil"
test_file  = None

def get_claim(claim_id, allsnippets=False):
    """Go to the web interface to the db and run a query.
    """
    import urllib2
    url_base       = "http://disputefinder.cs.berkeley.edu/"
    claim_snippets ="thinklink/claim/<>/allsnippets.json"
    claim_tbl      = "claim/<>.json"
    
    # build url
    if allsnippets:
        url_src = url_base + re.sub("<>", str(claim_id), claim_snippets)
    else:
        url_src = url_base + re.sub("<>", str(claim_id), claim_tbl )
        
    # Open URL object
    print url_src, " < url"

    try:
        page = urllib2.urlopen(url_src)
    except:
        print >> sys.stderr, url_src, " web retrieval failed"
        sys.exit(1)

    # Set up proxy

    return page

########################################################################
class build_json_data:
    """Contains the two arrays, one for the yes class, the other for no
    for one claim."""

    #----------------------------------------------------------------------
    def __init__(self):
        """Constructor"""
        self.claim_id = -1
        self.text     = ''
        self.instance_count= -1

        self.yes_id       = []
        self.yes_abstract = []
        self.no_id        = []
        self.no_abstract  = []


    def read_pkl(self, cl_fd):
        
        try:
            self.contents = cl_fd.read()

        except:
            print >> sys.stderr,  "Could not read from", args[0].split()
            exit(-1)



    def grab_claim_header(self):
        hdr = ''
        found = re.findall("\{[^}]+\}", self.contents)
        if found:
            hdr = self.decode(found[0])
        self.claim_id = hdr.get('id')
        self.text     = hdr.get('text')
        self.instance_count= hdr.get('instance_count')
        #print self.__dict__, ' <<hdr'
        

    def swallow_all(self):
        cl_txt = ''
        for item in re.finditer("\{[^}]+\}", self.contents):
            raw_json = item.group()
            claim_hash = self.decode(raw_json)
            # print claim_hash.keys()
            if claim_hash['state'] == 'true':
                self.yes_id.append(claim_hash['id'])
                self.yes_abstract.append(claim_hash['abstract'])
            elif claim_hash['state'] == 'false':
                self.no_id.append(claim_hash['id'])
                self.no_abstract.append(claim_hash['abstract'])
        self.contents = None # Don't serialize
        return self

                
            
    def decode(self, raw_json):
        """ Json decode wrapper"""
        cl_txt = self._clean_up_json(raw_json)
        j_txt = json.loads(cl_txt)
        if dbg: pprint.pprint(j_txt)
        if dbg: print '_'*60,'\n'
        return j_txt

    def _clean_up_json(self, file_txt):
        ## For now just ignore non-ascii (UTF8) chars
        file_txt = unicode(file_txt, errors = 'ignore')
        # file_txt = re.sub('""', '"', file_txt)
        # file_txt = re.sub('"\'\'"', '""', file_txt)
        return file_txt

########################################################################
def main(args):

    curdir = os.getcwd()
    print >> sys.stderr

    if test_file and re.search("json$", test_file):
        page = file(test_file)
        ## don't worry abt the header
        json_obj= build_json_data()
        json_obj.read_pkl(page)
        
    elif test_claim:
        page = get_claim(test_claim)
        ## fill in header
        json_obj= build_json_data(page)
        json_obj.grab_claim_header()

        if json_obj.instance_count < 100:
            print >> sys.stderr, "Skipping: instance_count = ", json_obj.instance_count
            sys.exit(1)
        page = get_claim(test_claim, allsnippets=True)
        json_obj.contents = page.read()

    else:
        print >> sys.stderr, "Wrong input type ", args

    training_data = json_obj.swallow_all()
    ## Pickle training data
    try:
        out_name = os.path.join(curdir, 'db_'+str(test_claim)+'claim.pkl')
        output = open(out_name, 'wb')
        pickle.dump(training_data, output) # , pickle.HIGHEST_PROTOCOL)
        print >> sys.stderr, 'Wrote ', out_name
        output.close()
    except pickle.PicklingError:
        print >> sys.stderr, 'Failed to serialize ', out_name

    print 'json yes', len(training_data.yes_id), 'no', len(training_data.no_id)

########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1

    if '-f' in sys.argv:
        n_arg = sys.argv.index('-f')
        test_file = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    if '-w' in sys.argv:
        n_arg = sys.argv.index('-w')
        test_claim = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])
        

    time.clock()
    args = sys.argv[1:]
    main(args)
    print >> sys.stderr, sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
