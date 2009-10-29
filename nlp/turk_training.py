#!/usr/bin/python
# turk_training.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   31 Aug 2009
#
"""
Deprecated:
Create the classifier ptree from the turk data and
save the serialized classfier.

Also convert the ptree into ngrams and print them

-v    Also print the question text to the screen
-n    depth of the prefix tree

Usage:
$ python turk_training.py [-v] turk_data.csv
"""
svn_id =   '$Id'

## Hash the turk excel csv files into a 2 dim vector of
## two text vectors - the first of yes text.

########################################################################


import time, sys
import csv, pprint, os, pickle, re
import ptree, n_grams, turkdata

sys.path.append('.\\lib')
import cv_constructor

dbg     =  0
verbose =  0
n_folds = 10

#_______________________________________________________________________

def main(args):

    # Create the turkdata training set.
    my_turk = turkdata.turkdata(args[0])
    read_it = turkdata.init_reader(my_turk)
    my_turk.read_all(read_it)

    yes_no_set = my_turk.training_set()
    if verbose:
        pprint.pprint(yes_no_set)

    ## Create the cross validaton folds from the pos & neg examples
    cv = cv_constructor.CrossValidationDataConstructor(yes_no_set[0], yes_no_set[1], numPartitions=n_folds)
    cv_set = cv.getDataSets()

    # pprint.pprint(cv_set.next)

    ## Run the plug-in classifier on each fold, computing fp & fn
    for (training_set, test_set) in cv_set:

        ptree_classifier = ptree.mult_sample_learn_ccc(yes_no_set[0], yes_no_set[1],
                                                   n_depth)

    ## Run the classifier on the entire set, to get training error.

    ## tabulate results.

    

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
        n_folds = int(sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])


    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    time.clock()
    args = sys.argv[1:]
    main(args)
    print sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"

### (c) 2009 Intel Corporation
