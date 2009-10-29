#!/usr/bin/python
# anomaly_ng.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   19-Oct-2009
#

"""
-N n     length of n_grams to retrieve

Usage:
$ python anomaly_ng.py [-N n] ont_or_more_files_of_lists_of_test_tokens
"""
csv_id =   '$Id$'
########################################################################

import os, pprint, re, string, sys, time
import word_dict, ptree

dbg      = False
news_dir = 'news/'
N_depth = 5

#_______________________________________________________________________
class pruned_ptree(ptree.ptree):

    def __init__(self, words, depth = 2,  lbls = ptree.labels()):
        super(pruned_ptree, self).__init__(words=words, dent='', depth=depth, lbls=lbls)
        self.memes = []

    def peruse_tree(self):
        self.peruse_tree_aux(self.root, '')
        print '\n1-grams ', len(self.root.kids)
        print 'nodes   ', ptree.pt_node.pt_node_ct
        print "\nMEMES"
        pprint.pprint(sorted(self.memes, key=(lambda x:x.__getitem__(0)), reverse=True))


    def peruse_tree_aux(self, node, n_phrase):
        "Recur down the tree"
        for a_node in node.kids:
            ## terminates when kids lists are empty
            ## Compute total token appearances
            tok_cts = sum([x for x in a_node.counts.values()])
            #if tok_cts >1:
            #    print '+', tok_cts, a_node.seq_no
            if tok_cts >N_depth and a_node.seq_no >(N_depth-1): 
                if self.words:
                    self.memes.append((tok_cts, n_phrase +' '+ self.words.index2word(a_node.w_index)))
                else:
                    self.memes.append((tok_cts, n_phrase +' '+ str(a_node.w_index)))
            if self.words:
                self.peruse_tree_aux(a_node, n_phrase = n_phrase +' '+ self.words.index2word(a_node.w_index))
            else:
                self.peruse_tree_aux(a_node, n_phrase = n_phrase +' '+ str(a_node.w_index))



#_______________________________________________________________________
class a_web_scrape(object):

    def __init__(self):
        self.src_fn = ''
        self.search_terms = []
        self.count = 0
        self.words = []
        self.claim_lbl = ''
        
    def one_tok_file(self, fn):
        self.src_fn = fn
        fd = open(os.path.join(news_dir,self.src_fn))
        words = fd.read()
        self.words = eval(words)
        self.count = sum(len(x) for x in words)
        print "retrieved ", self.count, " tokens from ", self.src_fn
        self.claim_lbl = re.findall('\w{6,6}\.txt', self.src_fn)[0]
        print self.claim_lbl

    def add_to_ptree(self, a_ptree):
        k = 0
        for page_words in self.words:
            if dbg: print '>>k ', k, len(page_words)
            ptree.build_tree(self.claim_lbl, page_words, a_ptree)
            k +=1
        return a_ptree
#_______________________________________________________________________
def main(args):

    # args = ["medical insuranceY5jPHX.txt", 'health policyTlYqX1.txt']
    my_dict = word_dict.word_dict()

    pages = []
    page_lbls = []
    for page in args:
        a_scrape = a_web_scrape()
        a_scrape.one_tok_file(page)
        pages.append(a_scrape)
        page_lbls.append(a_scrape.claim_lbl)
    my_ptree = pruned_ptree(my_dict, depth=(N_depth-1), lbls=ptree.labels(page_lbls))

    for p in pages:
        p.add_to_ptree(my_ptree)

    my_ptree.peruse_tree()
    print 40*'*'

########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1

    if '-N' in sys.argv:
        n_arg = sys.argv.index('-N')
        N_depth = int(sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])


    time.clock()
    args = sys.argv[1:]
    main(args)
    print  >> sys.stderr, sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
