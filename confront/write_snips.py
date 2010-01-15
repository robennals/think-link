#!/usr/bin/python
# write_snips.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   30 May 2009
#
"""
Create the classifier ptree from the turk data and
save the serialized classfier.

Also convert the ptree into ngrams and print them

-v    Also print the question text to the screen
-n    depth of the prefix tree

Usage:
$ python write_snips.py -n 2 [-v] data.csv
"""
svn_id =   '$Id: write_snips.py 654 2009-07-05 16:02:57Z jmagosta $'

## Hash the turk excel csv files into a 2 dim vector of
## two text vectors - the first of yes text, the second of no text
## then build the prefix tree for the classifier and 
## and serialize the output.

########################################################################


import time, sys
import csv, pprint, os, pickle, re
import ptree, n_grams, turkdata

dbg     =  0
verbose =  0
reps    = 10
n_depth = 2

#_______________________________________________________________________

def main(args):

    my_turk = turkdata.turkdata(args[0])
    read_it = turkdata.init_reader(my_turk)
    my_turk.read_all(read_it)

    yes_no_set = my_turk.training_set()
    if verbose:
        pprint.pprint(yes_no_set)

    ## do this if you've pickled the yes_no sets
    #fd = open("./mt_files/Batch_63422_result_training.pkl", 'rb')
    #ob = pickle.load(fd)

    #yes_no_set = [ob[0], ob[1]]
    ptree_classifier = ptree.mult_sample_learn_ccc(yes_no_set[0], yes_no_set[1],
                                                   n_depth)

    all_ngrams = n_grams.n_grams_depth_first(ptree_classifier, n_depth)

    print len(all_ngrams), " ngrams created"
    print '\nLOG LIKELIHOOD: ', n_grams.n_grams_prior(all_ngrams)
    [n.print_ngram(ptree_classifier.words) for n in all_ngrams]


    #    def store(self):
    cl_name = str(n_depth) + '_classifier_' + time.strftime("%M-%H-%j") + '.pkl'
    out_name = re.sub('.csv', cl_name, my_turk.name)
    try:
        outfd = open(out_name, 'wb')
        pickle.dump(ptree_classifier, outfd) # , pickle.HIGHEST_PROTOCOL)
        print >> sys.stderr, 'Wrote ', out_name
        outfd.close()
    except pickle.PicklingError:
        print >> sys.stderr, 'Failed to serialize ', out_name


#_______________________________________________________________________
if __name__ == '__main__':
    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1
        #pdb.run('main(sys.argv)')
        #sys.exit(0)

    if '-v' in sys.argv:
        del(sys.argv[sys.argv.index('-v')])
        verbose = 1

    if '-n' in sys.argv:
        n_arg = sys.argv.index('-n')
        n_depth = int(sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])


    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    time.clock()
    args = sys.argv[1:]
    main(args)
    print sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"

### (c) 2009 Intel Corporation
