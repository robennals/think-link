#!/usr/bin/python
# cross_validate.py
#   This python module to compute classifier accuracy.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   17 Aug 2009
#   $Id: cross_validate.py 50 2009-10-13 16:35:08Z jmagosta $

"""Run a cross validation on training data.  Given a pkl of two lists, one positive
examples, one negative examples, create cv folds and run ?? classifier on them.

-R    Generate an R batch script that creates an eps file with a plot of classifier
      accuracy.

Usage:
python cross_validate.py training_data.pkl [-f 10] [-R]
"""

import glob, os, pprint, sys
from extract_training import *
import ptree, n_grams

dbg = 0
db_dir = 'claims/'
db_pat = 'db_6486*pkl'
folds  = 10
n_depth = 1
claim_title = ''


########################################################################
def build_class(yes_txt, no_txt):

    ## Be careful, this destroys its arguments.
    yes_txt = [x for x in yes_txt] # copy sequence
    no_txt = [x for x in no_txt] # copy sequence

    ptree_classifier = ptree.mult_sample_learn_ccc(yes_txt, no_txt, n_depth)
    if dbg:
        ptree_classifier.print_tree()
    return ptree_classifier

###---------------------------------------------------------------------
def run_class(words, ptree_classifier, tst_txt):
    ## Replace this with proper tokenization & stemming
    if dbg: print ">> \t", tst_txt,
    tst_txt = tst_txt.split()

    classification = n_grams.embellish_tree(tst_txt, ptree_classifier)
    all_ngrams = n_grams.text_lkhd(classification, n_depth, 1, add_words=True)
    all_ngrams.walk_ng_tree()

    ## Look at the most salient features
    if dbg:
        multiplicity = [z.likelihood_msg for z in all_ngrams]
        all_ngrams.sort_by_keys(multiplicity)
        [ng.print_ngram(words) for ng in all_ngrams.sorted]
        print '\nLOG LIKELIHOOD: ',
    logl = all_ngrams.sum_log_likelihood
    return logl

###--------------------------------------------------------------------
def rpt_class(label, samples, classer):
    "Run the classifier over the samples, and return a vector of labeled log likelihoods."
    logl = []
    for txt in samples:
        logl.append(run_class(classer.words, classer, txt))
    logl.sort()
    if dbg:
        print label, " SUM LL: ", sum(logl)
    return zip([label]*len(logl), logl)


###--------------------------------------------------------------------
def R_input(lofl, fn):
    'Convert a list of list into R interpretable-data.  & run graphs'
    fd = open(fn+'.R', 'w')
    fd.write('title.phrase <- "'+claim_title+'"\n')
    a_row = ['"{0}", {1}'.format(x[0], x[1]) for x in lofl]
    fd.write('sample.ll <- c('+', '.join(a_row)+')\n')
    fd.write('sample.ll <- matrix(sample.ll, ncol=2, byrow=T)\n')
    fd.write('source("../classifier_rpt.R")\n')
#    fd.write('args <- commandArgs(TRUE)\n')
    fd.write('classifier.rpt(sample.ll, main.phrase=title.phrase, fn=paste("'+fn+'", ".eps", sep=""))\n')
    fd.close()
    os.system('R CMD BATCH -vanilla '+fn+'.R \n')



########################################################################
class build_cv_data:
    """Use the cross validation constructor class to create a
    data object from the training data to compute accuracy"""

    #----------------------------------------------------------------------
    def __init__(self):
        """Constructor"""
        pass


########################################################################
def main(args):

    global claim_title
    os.chdir(db_dir)

    #try:
    #    for db in glob.glob(args):
    db = args
    print "file: ", db
    cl_fd = file(db)
    cl_pt = pickle.load(cl_fd)
    claim_title = cl_pt.text
    print claim_title
    cl_pt.yes_abstract = [file_txt.encode('utf8') for file_txt in cl_pt.yes_abstract]
    cl_pt.no_abstract = [file_txt.encode('utf8') for file_txt in cl_pt.no_abstract]

    clyer = build_class(cl_pt.yes_abstract, cl_pt.no_abstract)

    ## positive cases
    pos = rpt_class ('yes', cl_pt.yes_abstract, clyer)
        
    ## negative cases
    neg = rpt_class('no', cl_pt.no_abstract, clyer)
    
    pos.extend(neg)
    R_input(pos, re.sub('.pkl', '', db))

    return(None)
        #except Exception, e:
    #    print "error :", e
    #    exit(-1)

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
        folds = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    time.clock()
    args = sys.argv[1:]
    lofl = main(args[0])
    print >> sys.stderr, sys.argv , "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation


