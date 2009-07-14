#!/usr/bin/python
# turkdata.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   30 May 2009
#
"""
Class to hash the turk excel csv files into a set of vectors and dicts and
serialize the output.

-v Also print the question text to the screen
Usage:
$ python turkdata.py -v data.csv

Note - the pkl file cannot be read by another file except using
from turkdata import *

Better yet - import this class into both the writing and reading app,
and don't execute this file.
"""
csv_id =   '$Id: turkdata.py 654 2009-07-05 16:02:57Z jmagosta $'
########################################################################


import time, sys
import csv, pprint, os, pickle, re

dbg     =  0
verbose =  0
reps    = 10
rct     =  0
vrb     =  0

#_______________________________________________________________________
### reg exp for digits in header labels
#  regexp_digits = re.compile('Input[^\d]*\d+')

def Is_searchtext(the_hdr):
    digits = re.compile('Input.searchtext').match(the_hdr) # assume constant for the trial row
    return (digits)

def Input_no(the_hdr):
    digits = re.compile('Input\.snip[^\d]*(\d+)').match(the_hdr) # Ends with an int
    return int(digits.groups()[0])

def URL_no(the_hdr):
    digits = re.compile('Input\.url[^\d]*(\d+)').match(the_hdr) # Ends with an int
    return int(digits.groups()[0])

def Title_no(the_hdr):
    digits = re.compile('Input\.title[^\d]*(\d+)').match(the_hdr) # Ends with an int
    return int(digits.groups()[0])

def Answer_no(the_hdr):
    digits = re.compile('Answer[^\d]*(\d+)').match(the_hdr) # Ends with an int
    return int(digits.groups()[0])
#
#_______________________________________________________________________
class turkdata(list):

    def __init__(self, name):

        ## name of the file read
        self.name = name
        ## Keep track of what claim we re working on
        self.current_claim = None
        ## array of the dicts for each trial
        self  = []

    def read_one(self, read_iterator):

        global rct

        ## Grab an entire record into a dict
        a_trial = {}
        ## termination condition??
        recA = read_iterator.next()
        rct +=1
        if vrb: print rct
        recB = read_iterator.next()
        rct +=1
        if vrb: print rct

        ## identity of this object
        if not self.current_claim == recB['Input.claim']: # not a_trial.has_key('Input.claim'):
            a_trial['Input.claim'] = recB['Input.claim']
            self.current_claim = recB['Input.claim']
            if vrb: print self.current_claim
        if recB.has_key('HITId'):
            a_trial['HITId']   = recB['HITId']

        ## copy those parts of the field to keep
        ## into a list of length 10

        ## Grab turk workers
        a_trial['WorkerA'] = recA['WorkerId']
        a_trial['WorkerB'] = recB['WorkerId']

        ## field count
        j = 0
        ## Remove the 10 Q & A fields
        # preallocate
        a_trial['Q']     = reps*[None]
        a_trial['URL']   = reps*[None]
        a_trial['title'] = reps*[None]
        a_trial['A']     = reps*[0]
        for a_hdr in recA.iterkeys():
            ## Search text
            try:
                if Is_searchtext(a_hdr) and not a_trial.has_key('searchtext'):
                    a_trial['searchtext'] = recA[a_hdr]
                    if verbose:
                        print 'st', recA[a_hdr]
            except:
                pass

            ## Questions (snippets)
            try:
                j = Input_no(a_hdr)
                a_trial['Q'][j-1] = recA[a_hdr]
                if verbose:
                    print recA[a_hdr]
            except:
                pass

            ## URLs
            try:
                j = URL_no(a_hdr)
                a_trial['URL'][j-1] = recA[a_hdr]
                if verbose:
                    print recA[a_hdr]
            except:
                pass

            ## title
            try:
                j = Title_no(a_hdr)
                a_trial['title'][j-1] = recA[a_hdr]
                if verbose:
                    print recA[a_hdr]
            except:
                pass

            ## Answers
            try:
                j = Answer_no(a_hdr)
                ## Encoding 0 == no, no; 1 or 2 = yes,no; 3 = yes,yes
                a_trial['A'][j-1] = (recA[a_hdr]=='yes') + 2*(recB[a_hdr]=='yes')
            except:
                pass

            ## How many snippets were read?

        if verbose:
            pprint.pprint(a_trial)
            raw_input('go')
        return a_trial

    def read_all(self, read_it):

        while True:
            try:
                self.append(self.read_one(read_it))

            except StopIteration:
                break

    def trial_ct(self):
        return len(self)

    def snippet_ct(self, trial_id):
        return len(self[trial_id]['A'])

    def get_snippets(self, trial_id):
        "An array of array of strings"
        #trail_ar = self
        queries = self[trial_id]['Q']
        return queries

    def get_labels(self, trial_id):
        "An array of array of 0..3"
        queries = self[trial_id]['A']
        return queries

    def store(self):
        out_name = re.sub('csv', 'pkl', self.name)
        try:
            output = open(out_name, 'wb')
            pickle.dump(self, output) # , pickle.HIGHEST_PROTOCOL)
            print >> sys.stderr, 'Wrote ', out_name
            output.close()
        except pickle.PicklingError:
            print >> sys.stderr, 'Failed to serialize ', out_name

    def training_set(self, claim_index =1):
        """Assemble training data for ptrees.
        If there are multiple claims in one file, then use the n-th one
        to appear, as told by claim_index
        """
        self.yes_text = []
        self.no_text  = []
        # pdb.set_trace()
        ## Assume the first trial always has a claim
        the_claim = self[0]['Input.claim']
        claim_ct = 1
        found_claim = False  # Is this the claim to use?

        for i in xrange(self.trial_ct()):
            ## Count input claims
            if self[i].has_key('Input.claim') and not found_claim:
                if self[i]['Input.claim'] != the_claim:
                    # this trial starts a new claim.
                    the_claim = self[i]['Input.claim']
                    claim_ct +=1

                if claim_ct == claim_index:
                    ## Its the one we want
                    found_claim = True

            if found_claim:
                sns = self.get_snippets(i)
                ans = self.get_labels(i)
                for k in xrange(self.snippet_ct(i)):
                    if ans[k] == 3: ## == yes
                        self.yes_text.append(sns[k])
                    elif ans[k] == 0:
                        self.no_text.append(sns[k])
                    else:
                        pass

        return tuple((self.yes_text, self.no_text))



#_______________________________________________________________________
## Ancillary defs for the class
## File objects can not be serialized - so don't include them in the object
def init_reader(turk_obj):
    fd = open_excel(turk_obj.name)
    return csv.DictReader(fd)

#_______________________________________________________________________
def open_excel(fname):

    fd = None
    try:
        fd = open(fname, 'rb')
    except:
        print >> sys.stderr,  "Turkdata: open of "+fname+" failed\n"
        sys.exit(-1)
    return fd

#_______________________________________________________________________

def main(args):

    my_turk = turkdata(args[0])
    read_it = init_reader(my_turk)
    my_turk.read_all(read_it)

    # fd = open("../mt_files/Batch_63422_result.pkl", 'rb')
    # ob = pickle.load(fd)

    x = my_turk.get_snippets(0)
    #if verbose:
    #    pprint.pprint(x)

    my_turk.store()


#_______________________________________________________________________
if __name__ == '__main__':
    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1
        #pdb.run('main(sys.argv)')
        #sys.exit(0)

    if '-v' in sys.argv:  # "verbose"
        del(sys.argv[sys.argv.index('-v')])
        vrb = 1

    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    time.clock()
    args = sys.argv[1:]
    main(args)
    print sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"

### (c) 2009 Intel Corporation
